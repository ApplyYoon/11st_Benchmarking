import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Plus } from 'lucide-react';

const HeroBanner = () => {
    return (
        <div style={{
            backgroundColor: '#0A1E3F', // Dark blue background similar to screenshot
            height: '400px',
            position: 'relative',
            overflow: 'hidden',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '50px'
        }}>
            <div style={{ width: '100%', maxWidth: '1280px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', position: 'relative' }}>

                {/* Text Content */}
                <div style={{ zIndex: 10 }}>
                    <div style={{ fontSize: '22px', marginBottom: '16px', opacity: '0.9', fontWeight: 'bold', color: '#B3CFFF' }}>랜덤 쿠폰에 릴레이 특가까지!</div>
                    <div style={{ fontSize: '52px', fontWeight: 'bold', lineHeight: '1.25', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                        연말 감사제<br />
                        ~100만P 당첨 혜택
                    </div>
                </div>

                {/* Snow Globe Graphic */}
                <div style={{
                    position: 'relative',
                    width: '380px',
                    height: '380px',
                    marginRight: '50px'
                }}>
                    {/* Glass Globe */}
                    <div style={{
                        width: '100%', height: '100%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 40%, transparent 70%)',
                        boxShadow: 'inset 0 0 50px rgba(255,255,255,0.2), 0 0 30px rgba(100,200,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ fontSize: '180px', position: 'relative', top: '20px' }}>🎁</div>
                        {/* Sparkles */}
                        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '10px', height: '10px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px white', opacity: 0.8 }}></div>
                        <div style={{ position: 'absolute', bottom: '30%', right: '20%', width: '6px', height: '6px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px white', opacity: 0.6 }}></div>
                    </div>
                    {/* Base */}
                    <div style={{
                        position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)',
                        width: '260px', height: '60px',
                        background: 'linear-gradient(to right, #050b14, #1a253a, #050b14)',
                        borderRadius: '10px 10px 50px 50px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                    }}></div>
                </div>
            </div>

            {/* Pagination Controls */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-120px)',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '20px',
                padding: '0 15px',
                height: '36px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Pause size={12} fill="white" style={{ cursor: 'pointer', marginRight: '10px' }} />
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>16</span>
                <span style={{ fontSize: '13px', opacity: 0.7, margin: '0 5px' }}>/</span>
                <span style={{ fontSize: '13px', opacity: 0.7 }}>22</span>
                <Plus size={14} style={{ cursor: 'pointer', marginLeft: '10px' }} />
            </div>

            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(30px)',
                display: 'flex',
                gap: '8px',
            }}>
                <button style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={18} />
                </button>
                <button style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default HeroBanner;
