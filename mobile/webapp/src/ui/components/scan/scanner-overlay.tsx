import { motion, AnimatePresence } from "framer-motion"
import { Camera } from "lucide-react"

interface ScannerOverlayProps {
    isScanning: boolean
    showFlash: boolean
}

export function ScannerOverlay({ isScanning, showFlash }: ScannerOverlayProps) {
    return (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            {/* Background Mask with Bokeh/Blur Effect */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* The Clear Viewfinder Area */}
                    <div className="w-72 h-96 bg-transparent border-2 border-white/20 rounded-3xl shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]" />
                </div>
            </div>

            {/* Animated Viewfinder Corners */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-96 relative">
                    {[0, 90, 180, 270].map((rotation) => (
                        <motion.div
                            key={rotation}
                            className="absolute w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl"
                            style={{ rotate: rotation, top: rotation < 180 ? -2 : 'auto', bottom: rotation >= 180 ? -2 : 'auto', left: (rotation === 0 || rotation === 270) ? -2 : 'auto', right: (rotation === 90 || rotation === 180) ? -2 : 'auto' }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        />
                    ))}

                    {/* Scanning Line Animation */}
                    {isScanning && (
                        <motion.div
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.8)] z-10"
                            initial={{ top: "10%" }}
                            animate={{ top: "90%" }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Capture Flash Effect */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div
                        className="absolute inset-0 bg-white z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    />
                )}
            </AnimatePresence>

            {/* Subtle floating icons or hints */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                <motion.div 
                    className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Ajustez pour scanner</span>
                </motion.div>
            </div>
        </div>
    )
}
