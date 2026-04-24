import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Building, Sparkles, LayoutGrid, ExternalLink, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Mail } from "lucide-react";
import { Footer } from '../../components/Footer';
import parking from "../../components/images/parking.jpg";
import firstabt from "../../components/images/firstabt.jpg";
import secondabt from "../../components/images/secondabt.jpg";
import katelyn from "../../components/images/katelyn.jpeg";
import lilfaith from "../../components/images/lilfaith.jpeg";
import venus from "../../components/images/venus.jpeg";
import kylle from "../../components/images/kylle.jpeg";
import ervin from "../../components/images/ervin.jpg";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen">

      <section className="relative h-screen flex items-center px-8 md:px-20 overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            className="w-full h-full object-cover"
            src={parking} alt="parking"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl"
        >
          <span className="text-secondary font-headline tracking-[0.3em] uppercase text-xs mb-6 block font-bold">
            Where every space becomes a moment of convenience
          </span>
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-tight mb-8 text-primary">
            Park ‘n  <br />
            <span className="text-[#660000]"> Spot</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            Park ‘n Spot isn't just a parking solution—it's a simple, user-friendly system designed to make parking easier for everyone. It helps people quickly find safe, convenient spaces while saving time and reducing stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="bg-[#660000] text-surface-container px-10 py-4 font-headline font-bold rounded-sm tracking-wide hover:bg-primary-container transition-all duration-300 active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
            >

              Get Started <ArrowRight size={16} />
            </Link>

          </div>
        </motion.div>

        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end gap-2 text-right">
          <div className="h-16 w-[1px] bg-outline mb-4"></div>
          <span className="font-headline font-bold text-sm tracking-widest text-primary">04 / EST. 2026</span>
          <span className="text-xs text-on-surface-variant font-body">ELECTIVE 1&2</span>
        </div>
      </section>

      <section className="py-32 px-8 md:px-20 bg-surface">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              viewport={{ once: true }}
              className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded-sm mt-12"
            >
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src={firstabt} alt="firstabt"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded-sm"
            >
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src={secondabt} alt="secondabt"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <div className="w-12 h-1 bg-primary mb-12"></div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-8">
              The Concept of the Park  ‘n  Spot
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Park ‘n Spot transforms parking opportunities into a connected, visible system.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-secondary-container p-3 rounded-sm text-on-secondary-container">
                  <Zap size={22} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-primary">Smart Movement</h4>
                  <p className="text-sm text-on-surface-variant">Location-based discovery designed to reduce search time and unnecessary traffic flow.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-secondary-container p-3 rounded-sm text-on-secondary-container">
                  <Users size={22} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-primary">Community-Driven System</h4>
                  <p className="text-sm text-on-surface-variant">Users contribute live parking availability, creating a dynamic and self-updating network.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-secondary-container p-3 rounded-sm text-on-secondary-container">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-primary">Purposeful Simplicity</h4>
                  <p className="text-sm text-on-surface-variant">A streamlined interface focused on what matters—finding a spot, instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-32 bg-surface-container-low px-8 pb-5 md:px-15">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-secondary font-headline tracking-widest uppercase text-xs mb-4 block font-bold">The Core Team</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">The Minds Behind Park ‘n Spot</h2>
          </div>
          <p className="max-w-md text-on-surface-variant">Meet the Core Team driving the next generation of intelligent parking systems.</p>
        </div>

        <div className="flex overflow-x-auto pb-12 gap-8 no-scrollbar -mx-8 px-8">
          {[
            {
              name: "Kylle Yelhzon Abajo",
              role: "Backend Developer",
              email: "kylleabajo@gmail.com",
              desc: "Computer Engineering Student -  Bulacan State University",
              img: kylle
            },
            {
              name: "Katelyn Bernardo",
              role: "Frontend Developer",
              email: "bernardokatelyn2@gmail.com",
              desc: "Computer Engineering Student -  Bulacan State University",
              img: katelyn
            },
            {
              name: "Lil Faith Clemente",
              role: "Frontend Developer",
              email: "lilfaithc@gmail.com",
              desc: "Computer Engineering Student -  Bulacan State University",
              img: lilfaith
            },
            {
              name: "Ervin John Ilagan",
              role: "Backend Developer",
              email: "ervinjohn.ilagan01@gmail.com",
              desc: "Computer Engineering Student -  Bulacan State University",
              img: ervin
            },
            {
              name: "Venus Valenzuela",
              role: "Frontend Developer",
              email: "venusvalenzuela14@gmail.com",
              desc: "Computer Engineering Student -  Bulacan State University",
              img: venus
            }
          ].map((member, i) => (
            <div key={i} className="min-w-[320px] flex-shrink-0 bg-surface-container-lowest p-8 rounded-sm shadow-[0_12px_40px_rgba(27,28,25,0.06)] relative border-l-4 border-[#660000]">
              <div className="w-20 h-20 bg-surface-container mb-6 rounded-full overflow-hidden ring-1 ring-[#660000] ring-offset-1">
                <img
                  className="w-full h-full object-cover"
                  src={member.img}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-headline font-bold text-xl mb-1">{member.name}</h3>
              <span className="text-xs text-secondary font-headline tracking-widest uppercase block mb-4">{member.role}</span>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{member.desc}</p>
              <div className="flex gap-4 border-t border-outline-variant pt-4">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-primary" />
                    <span className="text-xs text-on-surface-variant">
                      {member.email}
                    </span>
                  </div>

                )}
              </div>
            </div>
          ))}
        </div>
        <Footer />
      </section>

    </div>
  );

}
