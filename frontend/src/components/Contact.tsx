import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedinIn, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import { useState } from 'react';

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
        <section id="contact" className="py-24 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16">
                    Get In <span className="text-teal-400">Touch</span>
                </h2>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-2xl font-semibold text-teal-400 mb-6">Let's Collaborate</h3>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            I'm currently seeking opportunities with international schools in Dubai. Available for immediate placement with active UAE residency.
                        </p>

                        <div className="space-y-4">
                            <a href="tel:+971557177083" className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-teal-500/50 transition-all group">
                                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
                                    <FaPhone className="text-teal-400" />
                                </div>
                                <span className="text-gray-300">+971 55 7177 083</span>
                            </a>

                            <a href="mailto:suragaelzibaer@gmail.com" className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-teal-500/50 transition-all group">
                                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
                                    <FaEnvelope className="text-teal-400" />
                                </div>
                                <span className="text-gray-300">suragaelzibaer@gmail.com</span>
                            </a>

                            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                    <FaMapMarkerAlt className="text-teal-400" />
                                </div>
                                <span className="text-gray-300">Dubai, United Arab Emirates</span>
                            </div>

                            <a href="https://linkedin.com/in/suraga-elzibaer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all group">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                    <FaLinkedinIn className="text-blue-400" />
                                </div>
                                <span className="text-gray-300">Suraga Elzibaer</span>
                            </a>
                        </div>

                        {/* WhatsApp Button */}
                        <a
                            href="https://wa.me/971557177083?text=Hello%20Suraga,%20I%20found%20your%20website%20and%20would%20like%20to%20discuss%20opportunities."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-semibold text-white transition-all transform hover:scale-105"
                        >
                            <FaWhatsapp className="text-xl" />
                            Message on WhatsApp
                        </a>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    required
                                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Your Email"
                                    required
                                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <select 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-gray-300 focus:outline-none focus:border-teal-500/50 transition-colors"
                                >
                                    <option value="job">Job Inquiry</option>
                                    <option value="collaboration">Collaboration</option>
                                    <option value="general">General Question</option>
                                </select>
                            </div>
                            <div>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Your Message"
                                    required
                                    className="w-full px-6 py-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors resize-none"
                                ></textarea>
                            </div>
                            
                            {submitStatus === 'success' && (
                                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400">
                                    Thank you! Your message has been sent successfully.
                                </div>
                            )}
                            
                            {submitStatus === 'error' && (
                                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                                    Sorry, there was an error sending your message. Please try again or contact me directly.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <FaPaperPlane />
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
