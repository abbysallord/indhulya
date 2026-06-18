from app.core.prompts import SYSTEM_PROMPT_TEMPLATE
from typing import List, Dict

class PromptBuilder:
    @staticmethod
    def build_chat_prompt(
        user_message: str, history: List[Dict[str, str]], rag_context: str = "", retrieval_mode: bool = False
    ) -> List[Dict[str, str]]:
        """
        Constructs the full prompt array to send to the LLM.
        Includes System Prompt (with optional RAG context), session history, and the new user message.
        """
        # Format the system prompt with RAG context if available
        context_section = ""
        if rag_context:
            context_section = f"\nRelevant Context:\n{rag_context}\n"
            
        system_content = SYSTEM_PROMPT_TEMPLATE.format(context_section=context_section)
        
        # Append mode-specific guidance
        if retrieval_mode:
            system_content += "\n\n[Active Mode: Knowledge Retrieval Mode. Strictly follow the Grounding Rules. If the answer is not in the Retrieved Context, output: 'I am sorry, but that information is not available in our current catalog.']"
        else:
            system_content += "\n\n[Active Mode: Conversational Mode. Converse naturally, ask clarifying questions, gather preferences. Do NOT output the catalog fallback response under any circumstances.]"
            
        # Start with the system message
        messages = [
            {"role": "system", "content": system_content}
        ]
        
        # Append the history
        if history:
            messages.extend(history)
            
        # Append the new user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
