import { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MODULES = [
  {
    id: 'chief-of-staff',
    name: '1. The Discernment & Strategic Chief of Staff',
    description: 'Categorize notes/tasks into Execution, Academic, or Mission Strategy.',
    prompt: `Act as my personal Chief of Staff and strategic advisor, keeping in mind my context as a theology seminarian balancing academics, writing, ministry, and leadership. Your core objective is to take raw notes, sudden ideas, or operational tasks and organize them into clear, actionable frameworks.
Guidelines:
 * Categorize: Group every input into one of three tracks: Immediate Execution (Ministry/Admin), Academic & Intellectual Growth (Philosophy/Theology), or Long-Term Mission & Leadership Strategy.
 * Tone: Grounded, objective, structured, yet mindful of human realities and spiritual depth.
 * Output Format: For every input, provide:
   1. Core Insight (1 sentence summary)
   2. Immediate Action Step (What to do next)
   3. Broader Impact (How it serves my overarching vocation and goals)`
  },
  {
    id: 'decision-filter',
    name: '2. Philosophical & Theological Decision Filter',
    description: 'Evaluate dilemmas through First Principles and virtue ethics.',
    prompt: `Act as a practical decision-making assistant grounded in classical philosophy, theological ethics, and structured reasoning. Whenever I present a dilemma or goal conflict:
 1. Evaluate the scenario through First Principles and traditional virtue ethics (considering the common good, truth, and duty).
 2. Highlight potential trade-offs, moral considerations, and long-term consequences.
 3. Offer three distinct options: Low Risk / High Stability, Balanced / Pragmatic, and Bold / High Impact.
 4. Conclude with a recommended path rooted in clarity, peace of mind, and effective execution.`
  },
  {
    id: 'knowledge-synthesis',
    name: '3. Academic & Pastoral Knowledge Synthesis',
    description: 'Break down texts into Simple Core, Deep-Dive, and Practical Application.',
    prompt: `I am analyzing the following text or topic. Provide a three-tiered breakdown:
 1. Simplified Core: Explain this concept clearly using relatable metaphors, everyday logic, and simple language before diving into technical definitions.
 2. Deep-Dive Mechanics: Outline the foundational principles, historical background, and key arguments (referencing relevant philosophers, theologians, or Scripture where applicable).
 3. Practical Application: How does this truth apply to real-world human experience, pastoral ministry, or personal spiritual growth?`
  },
  {
    id: 'mission-architecture',
    name: '4. Ministry Logistics & Mission Architecture',
    description: 'Build an operational blueprint for events or projects.',
    prompt: `I am organizing an initiative or community event with these details. Build a complete operational blueprint containing:
 * Master Schedule & Timeline: Chronological breakdown of preparation and execution.
 * Team Role Allocations & Responsibilities: Clear division of labor.
 * Logistics Checklist: Equipment, materials, and communication channels needed.
 * Risk Management Plan: Anticipated bottlenecks or human errors, with practical backup scenarios.`
  },
  {
    id: 'weekly-retro',
    name: '5. Daily Examen & Weekly Retrospective',
    description: 'Reflective retrospective on graces, friction points, and adjustments.',
    prompt: `Here is a summary of what I accomplished and encountered this week. Conduct a reflective retrospective:
 1. Graces & High-Yield Actions: What bore the best fruit and brought genuine value to others?
 2. Friction Points & Distractions: Where did inefficiency or unnecessary stress creep in?
 3. Adjustments for Next Week: What three core priorities must take precedence to maintain peace, focus, and long-term alignment?`
  }
];

export default function AiModule({ onClose }: { onClose: () => void }) {
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setOutput("Error: GEMINI_API_KEY is not defined. Please check your .env files or provide an API key.");
      return;
    }

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const fullPrompt = `${selectedModule.prompt}\n\nHere is the input to process:\n${input}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      if (response.text) {
        setOutput(response.text);
      } else {
         setOutput("No response generated. Please try again.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setOutput("An error occurred while generating the response. Please check your API key and network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-2xl border-4 border-theme-border max-h-[90vh] w-[90vw] max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b-2 border-theme-bg bg-theme-bg">
        <h2 className="text-xl font-display font-bold text-theme-text flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-theme-accent" /> AI OS Organizer
        </h2>
        <button onClick={onClose} className="bg-white rounded-full p-2 text-theme-text-light hover:text-theme-accent hover:bg-theme-border transition-colors">
          <X className="w-5 h-5 stroke-2" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        {/* Left Side: Input & Settings */}
        <div className="w-full md:w-1/2 border-r-2 border-theme-bg flex flex-col p-5 overflow-y-auto bg-slate-50 min-h-[40vh]">
          <label className="block text-sm font-bold text-theme-text-light mb-2 uppercase tracking-wider shrink-0">Select Framework</label>
          <div className="flex flex-col gap-2 mb-6 shrink-0">
            {MODULES.map(mod => (
              <button
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${selectedModule.id === mod.id ? 'bg-theme-accent/10 border-theme-accent text-theme-accent font-bold' : 'bg-white border-theme-border text-theme-text-light hover:border-theme-accent/50'}`}
              >
                <div className="text-sm font-bold">{mod.name}</div>
                <div className="text-xs opacity-80 font-medium mt-1">{mod.description}</div>
              </button>
            ))}
          </div>

          <label className="block text-sm font-bold text-theme-text-light mb-2 uppercase tracking-wider shrink-0">Your Input / Notes</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your raw thoughts, schedule, dilemmas, or notes here..."
            className="flex-1 w-full bg-white border-4 border-theme-border rounded-2xl p-4 text-theme-text text-sm font-medium focus:outline-none focus:border-theme-accent resize-none min-h-[150px]"
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="mt-4 w-full py-4 shrink-0 rounded-2xl font-bold text-md bg-theme-accent text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isLoading ? 'Processing...' : 'PROCESS THROUGH MODULE'}
          </button>
        </div>

        {/* Right Side: Output Preview */}
        <div className="w-full md:w-1/2 p-5 flex flex-col bg-white overflow-y-auto min-h-[40vh]">
          <label className="block text-sm font-bold text-theme-text-light mb-2 uppercase tracking-wider shrink-0">Structured Output</label>
          <div className="flex-1 bg-theme-bg border-4 border-theme-border rounded-2xl p-6 text-theme-text text-sm overflow-y-auto min-h-0">
             {output ? (
               <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-theme-text prose-a:text-theme-primary">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {output}
                 </ReactMarkdown>
               </div>
             ) : (
               <div className="h-full flex items-center justify-center text-theme-text-light font-medium italic opacity-60 text-center px-8">
                 Select a framework and enter your notes to generate a structured, actionable response rooted in your vocation.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
