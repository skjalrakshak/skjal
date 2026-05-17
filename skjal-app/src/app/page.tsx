"use client";

import { useEffect } from "react";
import Image from "next/image";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { Footer2 } from "@/components/ui/shadcnblocks-com-footer2";
import {
  Droplets,
  Shield,
  Brain,
  Sun,
  Zap,
  BarChart3,
  Globe,
} from "lucide-react";
import { AnimatedTestimonials } from "@/components/blocks/animated-testimonials";

/* ─── Footer data ─── */
const footerData = {
  logo: {
    src: "/images/hero.png",
    alt: "SK Jalrakshak",
    title: "SK Jalrakshak",
    url: "/",
  },
  tagline: "Smart Water Intelligence Platform.",
  menuItems: [
    {
      title: "Platform",
      links: [
        { text: "Edge Telemetry", url: "#" },
        { text: "Cloud Dashboard", url: "#" },
        { text: "Predictive Analytics", url: "#" },
        { text: "Solar IoT Grid", url: "#" },
        { text: "API Integrations", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", url: "#" },
        { text: "Directors", url: "#" },
        { text: "Careers", url: "#" },
        { text: "Contact", url: "#" },
        { text: "Blog", url: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Documentation", url: "#" },
        { text: "Case Studies", url: "#" },
        { text: "FAQ", url: "#" },
      ],
    },
    {
      title: "Connect",
      links: [
        { text: "LinkedIn", url: "#" },
        { text: "Instagram", url: "#" },
        { text: "X / Twitter", url: "#" },
      ],
    },
  ],
  copyright:
    "© 2026 SK Jalrakshak Innovations Pvt Ltd. CIN: U26517AP2025PTC119413. All rights reserved.",
  bottomLinks: [
    { text: "Terms & Conditions", url: "#" },
    { text: "Privacy Policy", url: "#" },
  ],
};

/* ─── Stats ─── */
const stats = [
  { value: "1.5B+", label: "Gallons Tracked Daily", icon: Droplets },
  { value: "500+", label: "Miles of Infrastructure", icon: Globe },
  { value: "34%", label: "Waste Reduction", icon: BarChart3 },
  { value: "15+", label: "Municipal Partners", icon: Zap },
];

/* ─── Features ─── */
const features = [
  {
    icon: Zap,
    title: "Sub-millisecond Latency",
    desc: "When a pipe bursts at 3 AM, every millisecond counts. Our edge-first architecture delivers alerts faster than a heartbeat.",
  },
  {
    icon: Shield,
    title: "Military-Grade Durability",
    desc: "Our sensors have survived monsoon floods, desert heat, and chemical plants that would corrode steel in weeks.",
  },
  {
    icon: Brain,
    title: "Predictive Intelligence",
    desc: "Our ML models have learned from millions of real-world events. They tell you what's coming 72 hours before it arrives.",
  },
  {
    icon: Sun,
    title: "Solar-Powered & Off-Grid",
    desc: "No power grid? No cell towers? No problem. Our solar-powered nodes run independently for years.",
  },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    id: 1,
    content:
      "Before SK Jalrakshak, we were flying blind. Now I get an alert on my phone before my field teams even know something's wrong. Our response time dropped by 80%.",
    name: "Ravi Chandra",
    role: "Operations Director, Hyderabad Metro Water",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=rajesh",
  },
  {
    id: 2,
    content:
      "I've installed sensors in places where equipment usually lasts six months. Theirs have been running for eighteen — through two monsoon seasons — without a single hiccup.",
    name: "Satish Chandra",
    role: "Field Engineer, National Water Board",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=priya",
  },
  {
    id: 3,
    content:
      "Their AI flagged a hairline fracture in one of our main distribution pipes. Three days later, our manual inspection confirmed it. If that pipe had burst, we were looking at ₹2 crore in emergency repairs.",
    name: "Anand Verma",
    role: "Infrastructure Manager, AP State Utilities",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=anand",
  },
  {
    id: 4,
    content:
      "I was skeptical about another 'enterprise dashboard.' But my whole team — including the non-technical field staff — picked it up in a day. It just works.",
    name: "Meera Nair",
    role: "Technology Lead, Chennai Corp",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=meera",
  },
  {
    id: 5,
    content:
      "Twelve facilities, all connected, all streaming live data. The consistency is remarkable. We saw positive ROI within the first quarter, and our board is now asking why we didn't do this five years ago.",
    name: "Vikram Patel",
    role: "Plant Manager, Gujarat Water Authority",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=vikram",
  },
  {
    id: 6,
    content:
      "We used to send crews out with clipboards to read gauges. Now the gauges talk to us. We've freed up 400+ man-hours every month.",
    name: "Karan Desai",
    role: "Water Works Supervisor, Vizag Municipal",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=karan",
  },
];

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ═══ HERO — Scroll Expansion Video ═══ */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1"
        posterSrc="/images/hero.png"
        bgImageSrc="/images/hero.png"
        title="Smart Water Intelligence"
        date="SK Jalrakshak Innovations"
        scrollToExpand="↓ Scroll to explore"
        textBlend
      >
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl border border-gray-200 bg-gray-50/50"
            >
              <s.icon className="w-6 h-6 mx-auto mb-3 text-sky-500" />
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ─── About Content ─── */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
            About
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            We started with a simple question: why does so much water disappear
            before it ever reaches people?
          </h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            SK Jalrakshak Innovations (CIN: U26517AP2025PTC119413) was born from
            frustration with the status quo. Across India, aging pipelines leak
            billions of gallons daily while operators rely on spreadsheets and
            guesswork. We knew there had to be a better way.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            So we built it. Our edge sensors go where no monitoring system has
            gone before — deep underground, in corrosive treatment tanks, across
            hundreds of miles of rural pipeline. They talk to our cloud in
            real-time, and our AI spots trouble before humans ever could.
          </p>
        </div>

        {/* ─── Showcase Image ─── */}
        <div className="max-w-5xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/images/dashboard.png"
            alt="Cloud analytics dashboard"
            width={1280}
            height={720}
            className="w-full h-auto"
          />
        </div>

        {/* ─── Features Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-sky-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Sensor + Solar Images ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/sensor.png"
              alt="IoT sensor on water pipeline"
              width={640}
              height={420}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/solar.png"
              alt="Solar-powered monitoring station"
              width={640}
              height={420}
              className="w-full h-auto"
            />
          </div>
        </div>
      </ScrollExpandMedia>

      {/* ═══ STORY SCROLL — Mission, Systems, Impact, Testimonials, CTA ═══ */}
      <FlowArt aria-label="SK Jalrakshak Story">
        {/* Section: The Mission */}
        <FlowSection
          aria-label="Our Mission"
          style={{ background: "#ff5e00", color: "#fff" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            01 — The Mission
          </p>
          <hr className="my-[2vw] border-none border-t border-white/40" />
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
            Zero
            <br />
            Waste
            <br />
            Water
          </h2>
          <hr className="my-[2vw] border-none border-t border-white/40" />
          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed">
            Every drop matters. We&apos;re not just monitoring water —
            we&apos;re giving it a voice. Our systems listen, learn, and act so
            operators never have to guess again.
          </p>
        </FlowSection>

        {/* Section: How It Works */}
        <FlowSection
          aria-label="How It Works"
          style={{
            background: "linear-gradient(180deg, #44899c 0%, #ff5e00 100%)",
            color: "#fff",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            02 — How It Works
          </p>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
            Deploy.
            <br />
            Monitor.
            <br />
            Predict.
          </h2>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <div className="flex flex-wrap gap-[3vw]">
            {[
              {
                num: "01",
                title: "Install",
                desc: "Small, rugged sensor modules bolt onto existing infrastructure and start streaming in minutes. No rewiring, no downtime.",
              },
              {
                num: "02",
                title: "Monitor",
                desc: "One screen to see everything. Flow rates, chemical levels, pressure readings — all streaming live from hundreds of sensors.",
              },
              {
                num: "03",
                title: "Act",
                desc: "Our AI flags problems 72 hours early. One client avoided a ₹2 crore emergency repair because we caught a microfracture nobody else could see.",
              },
            ].map((step) => (
              <div key={step.num} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  {step.num} — {step.title}
                </p>
                <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <p className="mt-auto ml-auto max-w-[50ch] text-right text-[clamp(1rem,2.5vw,2rem)] leading-relaxed">
            We don&apos;t just monitor water — we anticipate its behavior across
            entire networks.
          </p>
        </FlowSection>

        {/* Section: Impact */}
        <FlowSection
          aria-label="Impact"
          style={{
            background: "linear-gradient(180deg, #916896 0%, #ff5e00 100%)",
            color: "#fff",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            03 — Real Results
          </p>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
            Real
            <br />
            World
            <br />
            Impact
          </h2>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <div className="flex flex-wrap gap-[3vw]">
            {[
              {
                val: "1.5B+",
                desc: "Gallons tracked daily. That's enough water to fill 2,272 Olympic swimming pools — every single day.",
              },
              {
                val: "34%",
                desc: "Average waste reduction in the first year. Not incremental — transformational.",
              },
              {
                val: "280%",
                desc: "Average ROI within 12 months. Some installations pay for themselves in under 90 days.",
              },
            ].map((stat) => (
              <div key={stat.val} className="min-w-[180px] flex-1">
                <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                  {stat.val}
                </p>
                <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
          <hr className="my-[2vw] border-none border-t border-white/30" />
          <p className="max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] leading-relaxed">
            Numbers tell stories that words can&apos;t. This is what happens
            when real intelligence meets real infrastructure.
          </p>
        </FlowSection>

        {/* Section: Testimonials */}
        <FlowSection
          aria-label="Testimonials"
          style={{
            background: "linear-gradient(180deg, #b01a00 0%, #ff5e00 100%)",
            color: "#fff",
          }}
        >
          <AnimatedTestimonials
            testimonials={testimonials}
            title="Trusted by Industry Leaders"
            trustedCompanies={[
              "L&T Construction",
              "Tata Projects",
              "Jal Jeevan Mission",
              "HMWSSB",
            ]}
            className="-mt-12"
          />
        </FlowSection>

        {/* Section: Team Image */}
        <FlowSection
          aria-label="Our Team"
          style={{
            background: "linear-gradient(180deg, #18181b 0%, #ff5e00 100%)",
            color: "#fff",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            05 — The People
          </p>
          <hr className="my-[2vw] border-none border-t border-black/10" />
          <div className="w-full rounded-2xl overflow-hidden">
            <Image
              src="/images/team.png"
              alt="Engineering team at water facility"
              width={1280}
              height={720}
              className="w-full h-auto"
            />
          </div>
          <hr className="my-[2vw] border-none border-t border-black/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[3vw]">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                Kameswara Sarma Nagabhatla
              </p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
                Director · DIN 11111205
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wider">
                Sirish Kumar Pagoti
              </p>
              <p className="text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-60">
                Director · DIN 11111206
              </p>
            </div>
          </div>
        </FlowSection>

        {/* Section: Contact CTA */}
        <FlowSection
          aria-label="Contact"
          style={{ background: "#ff5e00", color: "#fff" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            06 — Get In Touch
          </p>
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <h2 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
            Let&apos;s
            <br />
            Build
            <br />
            Together.
          </h2>
          <hr className="my-[2vw] border-none border-t border-white/20" />
          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] leading-relaxed">
            Every great infrastructure story starts with a conversation.{" "}
            <a
              href="mailto:info.skjipl@gmail.com"
              className="underline hover:opacity-80"
            >
              info.skjipl@gmail.com
            </a>
          </p>
        </FlowSection>
      </FlowArt>

      {/* ═══ FOOTER ═══ */}
      <Footer2 {...footerData} />
    </div>
  );
}
