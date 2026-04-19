import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export interface TaskChainConfig {
  triggerCategory: string;
  nextTaskDescriptionTemplate: string;
  nextTaskPriority: 'low' | 'medium' | 'high' | 'critical';
}

export const processTaskChaining = async (completedTask: any) => {
    try {
        const q = query(collection(db, 'chain_configs'), where('triggerCategory', '==', completedTask.category));
        const snapshots = await getDocs(q);
        
        if (snapshots.empty) {
            // AI Fallback: Predict next task
            const res = await fetch('/api/ai/next-step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedTask })
            });
            if (res.ok) {
                const aiNextTask = await res.json();
                await addDoc(collection(db, 'tasks'), {
                    ...aiNextTask,
                    status: 'TO_DO',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    description: `${aiNextTask.description}\n\n[AUTO_GENERATED_BY_CLAW_OS_INTELLIGENCE]`
                });
            }
            return;
        }

        for (const docSnap of snapshots.docs) {
            const config = docSnap.data() as TaskChainConfig;
            
            const nextTask = {
                title: `Follow-up: ${config.nextTaskDescriptionTemplate.replace('{title}', completedTask.title)}`,
                category: 'FOLLOW_UP',
                status: 'TO_DO',
                priority: config.nextTaskPriority.toUpperCase(),
                assignedAgent: '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                description: `Automatically generated based on completion of: ${completedTask.title}`
            };
            
            await addDoc(collection(db, 'tasks'), nextTask);
        }
    } catch (error) {
        console.error("Error processing task chaining:", error);
    }
};
