import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "We were skeptical about influencer marketing after wasting $50K on fake followers. Fluency's verification process changed everything. Our first campaign generated $106K in actual sales - not just likes.",
    author: "Sarah Chen",
    role: "CMO",
    company: "Urban Wear Fashion",
    result: "425% ROI",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
  },
  {
    quote: "Finally, a platform that understands what brands actually need. The ROI tracking is precise, and the creators are genuinely professional. It's the only tool we use now.",
    author: "Michael Ross",
    role: "Head of Growth",
    company: "TechFlow",
    result: "3.5x ROAS",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
  },
  {
    quote: "As a creator, I love that Fluency verifies my audience. It proves my value to brands and helps me land better partnerships. The payment transparency is also a huge plus.",
    author: "Jessica Wu",
    role: "Lifestyle Creator",
    company: "1.2M Followers",
    result: "$15K/mo",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-fluency-neon/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-stone-400 bg-clip-text text-transparent">
            Trusted by Growth-Focused Brands
          </h2>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Join hundreds of companies that have switched to verified influencer marketing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1C1C1C] rounded-2xl p-8 border border-stone-800 hover:border-fluency-neon/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-fluency-neon fill-fluency-neon" />
                ))}
              </div>

              <Quote className="text-stone-700 mb-4" size={32} />
              
              <p className="text-stone-300 mb-8 leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-stone-800 group-hover:border-fluency-neon transition-colors"
                />
                <div>
                  <div className="font-bold text-white">{testimonial.author}</div>
                  <div className="text-sm text-stone-500">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-stone-800 flex items-center justify-between">
                <span className="text-sm text-stone-500">Key Result</span>
                <span className="font-bold text-fluency-neon">{testimonial.result}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
