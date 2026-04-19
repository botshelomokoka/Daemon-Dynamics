import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface AgentReflection {
  agentName: string;
  taskTitle: string;
  status: string;
  reflection: string;
  nextStep: string;
}

/**
 * Commits a semantic memory shard to the Z-Axis.
 */
export async function commitToMemory(type: string, context: string, agent?: string, task?: string) {
  try {
    const embedResponse = await fetch('/api/ai/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: context })
    });
    
    if (!embedResponse.ok) throw new Error("Embedding API failure");
    const { embedding } = await embedResponse.json();

    await addDoc(collection(db, 'memory'), {
      type,
      context,
      agent: agent || 'SYSTEM',
      task: task || 'N/A',
      embedding,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Memory Commit Error:", err);
  }
}

/**
 * Generates technical reasoning with MCP context via Server-side Proxy.
 */
export async function generateAgentReflection(agentName: string, agentType: string, taskTitle: string): Promise<AgentReflection | null> {
  try {
    const response = await fetch('/api/ai/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentName, agentType, taskTitle })
    });
    
    if (!response.ok) throw new Error("Server AI Error");
    return await response.json() as AgentReflection;
  } catch (error) {
    console.error("Agent Reflection fetch failed:", error);
    return null;
  }
}
