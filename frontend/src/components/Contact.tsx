import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedinIn, FaWhatsapp, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'job',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', subject: 'job', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <section id="contact" className="py-32 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <h2 className="text-5xl md:text-6xl font-black mb-4">
                        <span className="text-white/20">05.</span> Get In <span className="premium-gradient-text">Touch</span>
                    </h2>
                    <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                </motion.div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-start">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h3 className="text-4xl font-black text-white mb-8 leading-tight">
                            Available for <br />
                            <span className="text-primary italic">Immediate Placement</span> <br />
                            in Dubai.
                        </h3>
                        <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                            I'm currently seeking opportunities with international schools in Dubai and the UAE. Available for immediate placement with active UAE residency.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: FaPhone, value: '+971 55 7177 083', href: 'tel:+971557177083' },
                                { icon: FaEnvelope, value: 'suragaelzibaer@gmail.com', href: 'mailto:suragaelzibaer@gmail.com' },
                                { icon: FaMapMarkerAlt, value: 'Dubai, UAE', href: '#' },
                                { icon: FaLinkedinIn, value: 'Suraga Elzibaer', href: 'https://linkedin.com/in/suraga-elzibaer', isExternal: true }
                            ].map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={item.href}
                                    target={item.isExternal ? '_blank' : undefined}
                                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                                    whileHover={{ x: 10 }}
                                    className="flex items-center gap-6 p-6 glass-card rounded-3xl group transition-all"
                                >
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors text-primary group-hover:text-slate-950">
                                        <item.icon className="text-2xl" />
                                    </div>
                                    <span className="text-lg font-bold text-gray-300 group-hover:text-white">{item.value}</span>
                                </motion.a>
                            ))}
                        </div>

                        <motion.a
                            href="https://wa.me/971557177083"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-12 inline-flex items-center gap-4 px-10 py-5 bg-[#25D366] text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-[#25D366]/20 transition-all"
                        >
                            <FaWhatsapp />
                            WhatsApp Me
                        </motion.a>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <form onSubmit={handleSubmit} className="glass-card rounded-[3rem] p-12 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

                            <div className="grid gap-8">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        required
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-lg font-medium group-focus-within:bg-white/[0.08]"
                                    />
                                </div>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email Address"
                                        required
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-lg font-medium group-focus-within:bg-white/[0.08]"
                                    />
                                </div>
                                <div className="relative group">
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-gray-300 focus:outline-none focus:border-primary/50 transition-all text-lg font-medium appearance-none"
                                    >
                                        <option value="job" className="bg-slate-900">Job Inquiry</option>
                                        <option value="collaboration" className="bg-slate-900">Collaboration</option>
                                        <option value="other" className="bg-slate-900">Other</option>
                                    </select>
                                </div>
                                <div className="relative group">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Your Message..."
                                        required
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-lg font-medium group-focus-within:bg-white/[0.08] resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <AnimatePresence>
                                {submitStatus === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 flex items-center gap-4 font-bold"
                                    >
                                        <FaCheckCircle />
                                        Message sent successfully!
                                    </motion.div>
                                )}

                                {submitStatus === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-4 font-bold"
                                    >
                                        <FaExclamationCircle />
                                        Error sending message. Try again.
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-5 bg-primary text-slate-950 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <FaPaperPlane className={isSubmitting ? 'animate-bounce' : ''} />
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
