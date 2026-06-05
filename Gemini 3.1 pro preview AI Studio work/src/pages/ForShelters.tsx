import React from "react";
import { Link } from "react-router-dom";
import { Section, Button } from "@/components/ui";
import { Code, Database, Zap } from "lucide-react";

export function ForShelters() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
           <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Free visibility for your hardest-to-place dogs.</h1>
           <p className="text-xl text-gray-400 leading-relaxed mb-10">
             Integrate your shelter software with our free Intake API and get your long-stay dogs in front of thousands of committed adopters instantly.
           </p>
           <Button size="lg" className="w-full sm:w-auto">Apply for API Access</Button>
        </div>
      </div>

      <Section>
         <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center tracking-tight">Why integrate with us?</h2>
            
            <div className="grid md:grid-cols-3 gap-10">
               <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                 <div className="text-teal-500 mb-6 bg-teal-50 w-14 h-14 flex items-center justify-center rounded-xl">
                   <Zap className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">Hyper-Targeted Traffic</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Adopters on our platform aren't just looking for a cute puppy. They specifically want to help the dogs who have been waiting the longest.
                 </p>
               </div>
               <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                 <div className="text-coral-500 mb-6 bg-coral-50 w-14 h-14 flex items-center justify-center rounded-xl">
                   <Database className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">Zero Manual Entry</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Our API fits into your existing shelter management software tools. Just sync once, and let automation handle the listings.
                 </p>
               </div>
               <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                 <div className="text-amber-500 mb-6 bg-amber-50 w-14 h-14 flex items-center justify-center rounded-xl">
                   <Code className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-3">Open & Free Forever</h3>
                 <p className="text-gray-600 leading-relaxed">
                   We will never charge shelters to list their dogs, and we will never sell premium placement. Ranking is solely based on time waiting.
                 </p>
               </div>
            </div>
         </div>
      </Section>

      <Section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-3xl overflow-hidden shadow-xl">
           <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center gap-4">
             <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-rose-500"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <div className="w-3 h-3 rounded-full bg-teal-500"></div>
             </div>
             <div className="text-gray-400 font-mono text-sm">POST /api/v1/intake</div>
           </div>
           <div className="p-6 md:p-8 overflow-x-auto text-sm font-mono text-gray-300">
             <pre>
{`{
  "external_id": "ASR-12044",
  "name": "Barnaby",
  "species": "dog",
  "intake_date": "2023-01-15T08:00:00Z",
  "primary_breed": "Labrador Retriever",
  "size": "large",
  "photo_urls": [
    "https://your-bucket.com/photos/barnaby-1.jpg"
  ],
  "listing_url": "https://yourshelter.org/adopt/barnaby"
}`}
             </pre>
           </div>
        </div>
        <div className="text-center mt-8">
           <p className="text-gray-500 mb-6 text-lg">Read the full API documentation and get your sandbox keys.</p>
           <Button variant="outline">View Developer Docs</Button>
        </div>
      </Section>
    </div>
  );
}
