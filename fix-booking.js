const fs = require('fs');
const file = 'src/app/(public)/booking/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { useState, useEffect } from "react"',
  'import { useState, useEffect, useRef } from "react"\nimport { gsap } from "gsap"\nimport { useGSAP } from "@gsap/react"'
);

content = content.replace(
  'const [dayFull, setDayFull] = useState(false)',
  'const [dayFull, setDayFull] = useState(false)\n  const stepContainerRef = useRef<HTMLDivElement>(null)\n\n  useGSAP(() => {\n    if (stepContainerRef.current) {\n      gsap.fromTo(stepContainerRef.current,\n        { opacity: 0, y: 20 },\n        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }\n      )\n    }\n  }, [step])'
);

content = content.replace(/bg-card/g, 'glass-card');
content = content.replace(/border-border/g, 'border-primary/10');
content = content.replace(/bg-background/g, 'glass-card');

const mainReturnRegex = /return \(\s*<>\s*<section className="[^"]+">\s*<div className="container-section text-center">\s*<h1 className="[^"]+">\s*Book an Appointment\s*<\/h1>\s*<p className="[^"]+">\s*Complete the steps below to book your hairstyle\s*<\/p>\s*<\/div>\s*<\/section>\s*<div className="container-section py-12">\s*<div className="mx-auto max-w-2xl">\s*\{step !== "confirmation" && renderProgress\(\)\}\s*\{step === "service" && renderServiceStep\(\)\}\s*\{step === "datetime" && renderDateTimeStep\(\)\}\s*\{step === "details" && renderDetailsStep\(\)\}\s*\{step === "payment" && renderPaymentStep\(\)\}\s*\{step === "confirmation" && renderConfirmationStep\(\)\}\s*<\/div>\s*<\/div>\s*<\/>/s;

const newMainReturn = `return (
    <div className="relative min-h-[90vh] bg-background pb-20">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      
      <section className="border-b border-primary/10 bg-white/40 backdrop-blur-md py-12 relative z-10 pt-32">
        <div className="container-section text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Book an Appointment
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary/70">
            Complete the steps below to book your hairstyle
          </p>
        </div>
      </section>

      <div className="container-section py-12 relative z-10">
        <div className="mx-auto max-w-2xl glass-card p-6 sm:p-10">
          {step !== "confirmation" && renderProgress()}

          <div ref={stepContainerRef}>
            {step === "service" && renderServiceStep()}
            {step === "datetime" && renderDateTimeStep()}
            {step === "details" && renderDetailsStep()}
            {step === "payment" && renderPaymentStep()}
            {step === "confirmation" && renderConfirmationStep()}
          </div>
        </div>
      </div>
    </div>
  )`;

content = content.replace(mainReturnRegex, newMainReturn);

content = content.replace(/block w-full rounded-lg border border-primary\/10 glass-card px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none/g, 
  'block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all');

content = content.replace(/block w-full rounded-lg border border-primary\/10 glass-card px-3 py-2 text-sm/g, 
  'block w-full rounded-xl border border-primary/10 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm');

content = content.replace(/rounded-lg bg-primary px-6 py-2/g, 'rounded-xl bg-primary px-6 py-3 shadow-elevated press-effect');
content = content.replace(/rounded-lg bg-accent px-6 py-2/g, 'rounded-xl bg-accent px-6 py-3 shadow-elevated press-effect');
content = content.replace(/rounded-lg border p-4/g, 'rounded-xl border p-5 shadow-sm press-effect');

fs.writeFileSync(file, content);
