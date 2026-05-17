"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Quote, Star } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
}

export interface AnimatedTestimonialsProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  testimonials?: Testimonial[];
  autoRotateInterval?: number;
  trustedCompanies?: string[];
  trustedCompaniesTitle?: string;
  className?: string;
}

export function AnimatedTestimonials({
  title = "Trusted by Industry Leaders",
  subtitle = "Don't just take our word for it. See how our smart water intelligence is transforming infrastructure operations.",
  badgeText = "04 — What People Say",
  testimonials = [],
  autoRotateInterval = 6000,
  trustedCompanies = [],
  trustedCompaniesTitle = "TRUSTED BY MUNICIPALITIES AND ENTERPRISES WORLDWIDE",
  className,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs for scroll animations
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1], // cinematic easing
      },
    },
  };

  // Trigger animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Auto rotate testimonials
  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotateInterval, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className={cn("w-full relative", className)}>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="grid grid-cols-1 gap-16 w-full lg:grid-cols-2 lg:gap-24"
      >
        {/* Left side: Heading and navigation */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-center"
        >
          <div className="space-y-8">
            {badgeText && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  {badgeText}
                </p>
                <hr className="mt-4 border-none border-t border-white/20" />
              </div>
            )}

            <h2 className="text-[clamp(3rem,6vw,5rem)] font-bold leading-[0.85] uppercase tracking-tighter text-white">
              {title.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </h2>

            <p className="max-w-[500px] text-white/70 md:text-xl leading-relaxed font-light">
              {subtitle}
            </p>

            <div className="flex items-center gap-3 pt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500 ease-out",
                    activeIndex === index
                      ? "w-12 bg-white"
                      : "w-3 bg-white/20 hover:bg-white/40",
                  )}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side: Testimonial cards */}
        <motion.div
          variants={itemVariants}
          className="relative h-full min-h-[420px] md:min-h-[460px] flex items-center justify-center"
        >
          <div className="relative w-full h-full max-w-lg mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || index}
                className="absolute inset-0 flex items-center"
                initial={{ opacity: 0, x: 80, filter: "blur(10px)" }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  x: activeIndex === index ? 0 : 80,
                  scale: activeIndex === index ? 1 : 0.95,
                  filter: activeIndex === index ? "blur(0px)" : "blur(10px)",
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  zIndex: activeIndex === index ? 10 : 0,
                  pointerEvents: activeIndex === index ? "auto" : "none",
                }}
              >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10 h-auto w-full flex flex-col transition-all duration-500 hover:border-white/40 group">
                  <div className="mb-8 flex gap-1.5">
                    {Array(testimonial.rating || 5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-amber-400 text-amber-400 drop-shadow-md"
                        />
                      ))}
                  </div>

                  <div className="relative mb-10 flex-1">
                    <Quote className="absolute -top-4 -left-4 h-12 w-12 text-white/10 rotate-180 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />
                    <p className="relative z-10 text-[clamp(1.1rem,1.5vw,1.4rem)] font-medium leading-relaxed text-white/90">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <Separator className="my-6 bg-white/10" />

                  <div className="flex items-center gap-5">
                    <Avatar className="h-14 w-14 border-2 border-white/20 shadow-lg">
                      {testimonial.avatar && (
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                      )}
                      <AvatarFallback className="bg-white/10 text-white border border-white/20 text-lg">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm font-medium text-white/60 tracking-wide uppercase mt-1">
                        {testimonial.role}{" "}
                        {testimonial.company && (
                          <>
                            <br />
                            {testimonial.company}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Decorative elements */}
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#ff5e00]/20 blur-[40px] pointer-events-none"></div>
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-blue-500/20 blur-[40px] pointer-events-none"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Logo cloud */}
      {trustedCompanies.length > 0 && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={controls}
          className="mt-32 pt-16 border-t border-white/10 text-center"
        >
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-12">
            {trustedCompaniesTitle}
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {trustedCompanies.map((company) => (
              <div
                key={company}
                className="text-2xl font-bold tracking-tighter text-white"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
