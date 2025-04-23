import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const barRefs = useRef([]);
  const quoteRef = useRef(null);
  const confettiRef = useRef(null);

  // Store bar animations in ref to trigger later
  const barAnimations = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Master timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });

      // Intro text animation
      tl.from(".about-text > *", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1)",
      });

      // Bar animations (with ironic delays)
      barAnimations.current = [
        gsap.to(barRefs.current[0], {
          width: "10%",
          duration: 0.3,
          ease: "power1.in",
          onComplete: () => {
            gsap.to(".tasks-completed-label", {
              textContent: "10%",
              duration: 0.5,
            });
          },
        }),
        gsap.to(barRefs.current[1], {
          width: "98%",
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          delay: 0.3,
        }),
        gsap.to(barRefs.current[2], {
          width: "100%",
          duration: 1.2,
          ease: "power2.out",
          onComplete: triggerConfetti,
        }),
      ];

      // Fake quote "attribution" reveal
      tl.to(
        quoteRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 1,
        },
        "-=1.5"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const triggerConfetti = () => {
    gsap.to(confettiRef.current, {
      opacity: 1,
      y: -20,
      duration: 0.5,
      stagger: 0.02,
      ease: "power1.out",
    });
    gsap.to(confettiRef.current, {
      opacity: 0,
      y: -40,
      duration: 0.3,
      delay: 0.5,
      ease: "power1.in",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="bg-gray-50 py-20 px-6 text-center overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <div className="about-text mb-12">
          <AnimatedTitle
            title="Our NON-Philosophy."
            containerClass="mt-5 !text-indigo-600 text-center"
          />
          <p className="text-xl text-gray-600 leading-relaxed">
            IdlePro wasn't built—it{" "}
            <span className="line-through">happened</span> napped into
            existence. While others chase productivity, we've scientifically
            proven that
            <span className="font-semibold"> doing less is literally more</span>
            (more naps, more snacks, more joy).
          </p>
        </div>

        {/* Fake quote with delayed attribution */}
        <div className="relative my-16">
          <blockquote className="text-2xl italic bg-white p-8 rounded-xl shadow-sm border-l-4 border-indigo-200">
            "The empty to-do list is the enlightened mind's mirror."
            <div
              ref={quoteRef}
              className="text-sm mt-2 opacity-0 scale-75 transform origin-center"
            >
              — <span className="text-gray-400">Misattributed to Buddha</span>
            </div>
          </blockquote>
        </div>

        {/* Enhanced metrics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 bg-white/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-200/60">
          {[
            {
              title: "Tasks Completed",
              color: "bg-red-400",
              value: "10%",
              labelClass: "tasks-completed-label",
              description: "(Perfectly Unfinished !)",
            },
            {
              title: "Nap Compliance",
              color: "bg-green-400",
              value: "98%",
              description: "(Industry leader)",
            },
            {
              title: "Productivity Dodged",
              color: "bg-blue-400",
              value: "100%",
              description: "(Flawless record)",
            },
          ].map((metric, i) => (
            <div key={i} className="group">
              <h4 className="font-medium text-lg mb-3 text-gray-700">
                {metric.title}
                {metric.description && (
                  <span className="block text-xs mt-1 text-gray-400 font-normal">
                    {metric.description}
                  </span>
                )}
              </h4>
              <div className="w-full h-3 bg-gray-200 rounded-full mt-2 overflow-hidden relative">
                <div
                  ref={(el) => (barRefs.current[i] = el)}
                  className={`h-full ${metric.color} rounded-full relative`}
                  style={{ width: "0%" }}
                >
                  {/* Confetti elements (hidden initially) */}
                  {i === 2 &&
                    [...Array(5)].map((_, j) => (
                      <span
                        key={j}
                        ref={j === 0 ? confettiRef : null}
                        className="absolute opacity-0 text-xs"
                        style={{
                          left: `${j * 20}%`,
                          top: "50%",
                          rotate: j * 72,
                        }}
                      >
                        🎉
                      </span>
                    ))}
                </div>
              </div>
              <p className={`text-sm mt-2 ${metric.labelClass || ""}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Easter egg footnote */}
        <p className="text-xs text-gray-400 mt-12">
          *Actual results may include mild guilt, but we recommend napping
          through it.
        </p>
      </div>
    </section>
  );
}
