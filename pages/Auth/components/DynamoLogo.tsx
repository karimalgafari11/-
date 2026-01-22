/**
 * رسم الدينمو المتحرك - شعار صفحة تسجيل الدخول
 */

import React from 'react';
import { Zap } from 'lucide-react';

interface DynamoLogoProps {
    rotation: number;
    pulseIntensity: number;
}

const DynamoLogo: React.FC<DynamoLogoProps> = ({ rotation, pulseIntensity }) => {
    return (
        <div className="relative w-32 h-32 sm:w-48 sm:h-48 lg:w-80 lg:h-80">
            {/* Outer Ring - Stator */}
            <div
                className="absolute inset-0 rounded-full border-8 border-slate-700"
                style={{
                    boxShadow: `
                        0 0 40px rgba(6, 182, 212, ${0.3 * pulseIntensity}),
                        inset 0 0 30px rgba(6, 182, 212, 0.1)
                    `
                }}
            />

            {/* Copper Windings */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-6 sm:w-3 sm:h-8 lg:w-4 lg:h-12 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-600 rounded"
                    style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: '50% 50%',
                        transform: `translate(-50%, -100%) rotate(${i * 30}deg) translateY(-40px)`
                    }}
                />
            ))}

            {/* Inner Rotor - Rotating */}
            <div
                className="absolute inset-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-600"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
                }}
            >
                {/* Rotor Poles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-8 h-2 bg-cyan-500/50 rounded-full"
                        style={{
                            left: '50%',
                            top: '50%',
                            transformOrigin: '50% 50%',
                            transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(30px)`
                        }}
                    />
                ))}
            </div>

            {/* Center Core */}
            <div className="absolute inset-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Zap className="text-white animate-pulse w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>

            {/* Energy Lines */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(from ${rotation}deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(6, 182, 212, 0.3), transparent)`,
                    opacity: pulseIntensity * 0.5 + 0.3
                }}
            />
        </div>
    );
};

export default DynamoLogo;
