import React, { useState, useEffect, useRef } from 'react';
import styles from './Anniversary.module.css';
import { 
    Play, Pause, SkipBack, SkipForward, Heart, 
    Plane, Home, TrendingUp, Mail, X, Bell 
} from 'lucide-react';

const MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-111718.mp3"; 

const REASONS = [
    "Your laugh is my favorite sound.",
    "You make the ordinary feel magical.",
    "You listen to understand, not just to reply.",
    "Your kindness inspires me daily.",
    "You make me feel safe to be myself."
];

const GOALS = [
    { title: "Travel", desc: "Japan, Italy, wherever you want to go.", icon: <Plane size={32} /> },
    { title: "Home", desc: "Building our sanctuary, brick by brick.", icon: <Home size={32} /> },
    { title: "Growth", desc: "Learning, failing, and succeeding together.", icon: <TrendingUp size={32} /> }
];

const ENVELOPES = [
    { title: "When you miss me", content: "Remember that I'm always with you, in spirit and in heart. Text me, I'm probably waiting for it." },
    { title: "When you're sad", content: "This too shall pass. You are stronger than you know, and I am here to hold you through it all." },
    { title: "When you need a smile", content: "Remember that time we got lost and laughed for hours? You are my joy." }
];

const START_DATE = new Date("2024-02-11T00:00:00");

const NOTIFICATION_SEQUENCE = [
    "You are my favorite notification.",
    "You are my calming thought.",
    "You are my best friend.",
    "I Love You."
];

const Anniversary = () => {
    const [loading, setLoading] = useState(true);
    const [visibleSections, setVisibleSections] = useState<string[]>([]);
    const [hearts, setHearts] = useState<{ id: number; left: number; animationDuration: number }[]>([]);
    
    // Notification State
    const [activeNotification, setActiveNotification] = useState<string | null>(null);

    // Music State
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reasons State
    const [currentReasonIndex, setCurrentReasonIndex] = useState(0);

    // Timer State
    const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Envelope State
    const [openEnvelope, setOpenEnvelope] = useState<number | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Initial Loading Effect
        const loadTimer = setTimeout(() => {
            setLoading(false);
        }, 2500);

        // Initialize Audio
        audioRef.current = new Audio(MUSIC_URL);
        audioRef.current.loop = true;

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setVisibleSections((prev) => [...new Set([...prev, entry.target.id])]);
                }
            });
        }, { threshold: 0.15 });

        const sections = document.querySelectorAll(`.${styles.observe}`);
        sections.forEach((section) => {
            if (section.id) observer.current?.observe(section);
        });

        // Timer Logic
        const timer = setInterval(() => {
            const now = new Date();
            const diff = now.getTime() - START_DATE.getTime();
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeElapsed({ days, hours, minutes, seconds });
        }, 1000);

        return () => {
            clearTimeout(loadTimer);
            observer.current?.disconnect();
            clearInterval(timer);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSurprise = () => {
        // Spawn hearts
        const newHearts = Array.from({ length: 50 }).map((_, i) => ({
            id: Date.now() + i,
            left: Math.random() * 100,
            animationDuration: 2 + Math.random() * 3
        }));
        setHearts(prev => [...prev, ...newHearts]);
        setTimeout(() => setHearts([]), 8000);

        // Trigger Notifications Sequence
        let delay = 0;
        NOTIFICATION_SEQUENCE.forEach((msg, index) => {
            setTimeout(() => {
                setActiveNotification(msg);
            }, delay);
            delay += 2500; // 2.5 seconds per message
        });

        // Clear after sequence
        setTimeout(() => {
            setActiveNotification(null);
        }, delay + 1000);
    };

    const nextReason = () => {
        setCurrentReasonIndex((prev) => (prev + 1) % REASONS.length);
    };

    return (
        <div className={styles.container}>
            {/* Cinematic Intro Overlay */}
            <div className={`${styles.introOverlay} ${!loading ? styles.introComplete : ''}`}>
                <div className={styles.introHeart}>
                    <Heart size={60} fill="none" color="#e53e3e" strokeWidth={1.5} />
                </div>
            </div>

            <div className={styles.noise}></div>
            
            {/* Hero Section */}
            <section id="hero" className={`${styles.hero} ${styles.observe} ${visibleSections.includes('hero') ? styles.visible : ''}`}>
                <div className={styles.heroContent}>
                    <p className={styles.date}>11 February 2026</p>
                    <h1 className={styles.title}>Two Years<br/><span className={styles.italic}>With You</span></h1>
                    <p className={styles.subtitle}>Still choosing you.</p>
                </div>
                <div className={styles.scrollIndicator}></div>
            </section>

            {/* Live Timer Section */}
            <section 
                id="timer" 
                className={`${styles.section} ${styles.timerSection} ${styles.observe} ${visibleSections.includes('timer') ? styles.visible : ''}`}
            >
                <h3 className={styles.sectionTitle}>Every Second Counts</h3>
                <div className={styles.timerGrid}>
                    <div className={styles.timerItem}>
                        <span className={styles.timerValue}>{timeElapsed.days}</span>
                        <span className={styles.timerLabel}>Days</span>
                    </div>
                    <div className={styles.timerSeparator}>:</div>
                    <div className={styles.timerItem}>
                        <span className={styles.timerValue}>{String(timeElapsed.hours).padStart(2, '0')}</span>
                        <span className={styles.timerLabel}>Hours</span>
                    </div>
                    <div className={styles.timerSeparator}>:</div>
                    <div className={styles.timerItem}>
                        <span className={styles.timerValue}>{String(timeElapsed.minutes).padStart(2, '0')}</span>
                        <span className={styles.timerLabel}>Mins</span>
                    </div>
                    <div className={styles.timerSeparator}>:</div>
                    <div className={styles.timerItem}>
                        <span className={styles.timerValue}>{String(timeElapsed.seconds).padStart(2, '0')}</span>
                        <span className={styles.timerLabel}>Secs</span>
                    </div>
                </div>
            </section>

             {/* Music Player Section */}
             <section 
                id="music" 
                className={`${styles.section} ${styles.musicSection} ${styles.observe} ${visibleSections.includes('music') ? styles.visible : ''}`}
            >
                <div className={styles.musicCard}>
                    <div className={styles.albumArt}>
                        <div className={`${styles.vinyl} ${isPlaying ? styles.spinning : ''}`}></div>
                        <div className={styles.centerLabel}></div>
                    </div>
                    <div className={styles.musicInfo}>
                        <p className={styles.songLabel}>Our Soundtrack</p>
                        <h4 className={styles.songTitle}>Piano Moment</h4>
                        <p className={styles.artist}>Classy Vibes</p>
                        <div className={styles.controls}>
                            <SkipBack size={20} fill="#fff" className={styles.controlIcon} />
                            <div className={styles.playButton} onClick={togglePlay}>
                                {isPlaying ? (
                                    <Pause size={20} fill="#000" />
                                ) : (
                                    <Play size={20} fill="#000" style={{ transform: 'translateX(2px)' }} />
                                )}
                            </div>
                            <SkipForward size={20} fill="#fff" className={styles.controlIcon} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Reasons Why Card - Verified "Quote Box" */}
            <section 
                id="reasons" 
                className={`${styles.section} ${styles.reasonsSection} ${styles.observe} ${visibleSections.includes('reasons') ? styles.visible : ''}`}
            >
                <h3 className={styles.sectionTitle}>Why I Love You</h3>
                <div className={styles.cardStack} onClick={nextReason}>
                    <div className={styles.cardContent}>
                        <span className={styles.quoteMark}>“</span>
                        <div className={styles.reasonTextWrapper}>
                            <p key={currentReasonIndex} className={styles.reasonText}>
                                {REASONS[currentReasonIndex]}
                            </p>
                        </div>
                        <span className={styles.tapHint}>(Tap for another reason)</span>
                    </div>
                </div>
            </section>

            {/* Open When Envelopes */}
            <section 
                id="envelopes" 
                className={`${styles.section} ${styles.envelopesSection} ${styles.observe} ${visibleSections.includes('envelopes') ? styles.visible : ''}`}
            >
                <h3 className={styles.sectionTitle}>Open When...</h3>
                <div className={styles.envelopesGrid}>
                    {ENVELOPES.map((env, idx) => (
                        <div key={idx} className={styles.envelopeCard} onClick={() => setOpenEnvelope(idx)}>
                            <Mail size={32} className={styles.envelopeIcon} />
                            <h4>{env.title}</h4>
                            <p>Read Message</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Letter Section */}
            <section 
                id="letter" 
                className={`${styles.section} ${styles.letterSection} ${styles.observe} ${visibleSections.includes('letter') ? styles.visible : ''}`}
            >
                <div className={styles.letterContent}>
                    <p className={styles.fadeItem}>Two years ago, you didn’t just enter my life,<br/> you quietly became its constant.</p>
                    <p className={styles.fadeItem}>In chaos, you became calm.<br/> In noise, you became home.</p>
                    <div className={styles.spacer}></div>
                    <p className={styles.fadeItem}>Loving you hasn’t been loud or dramatic —<br/> it’s been steady, grounding, real.</p>
                </div>
            </section>

            {/* Timeline Section */}
            <section 
                id="timeline" 
                className={`${styles.section} ${styles.timelineSection} ${styles.observe} ${visibleSections.includes('timeline') ? styles.visible : ''}`}
            >
                <h3 className={styles.sectionTitle}>Our Journey</h3>
                <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div className={styles.timelineContent}>
                            <span className={styles.timelineDate}>Feb 2024</span>
                            <h4>The Beginning</h4>
                            <p>When "you and me" became "us".</p>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div className={styles.timelineContent}>
                            <span className={styles.timelineDate}>Feb 2025</span>
                            <h4>One Year Strong</h4>
                            <p>Learning, growing, and building memories.</p>
                        </div>
                    </div>
                    <div className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div className={styles.timelineContent}>
                            <span className={styles.timelineDate}>Feb 2026</span>
                            <h4>Two Years</h4>
                            <p>And a lifetime to go.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Goals */}
            <section 
                id="future" 
                className={`${styles.section} ${styles.futureSection} ${styles.observe} ${visibleSections.includes('future') ? styles.visible : ''}`}
            >
                <h3 className={styles.sectionTitle}>The Next Chapter</h3>
                <div className={styles.goalsGrid}>
                    {GOALS.map((goal, idx) => (
                        <div key={idx} className={styles.goalCard}>
                            <div className={styles.goalIconWrapper}>
                                {goal.icon}
                            </div>
                            <h4>{goal.title}</h4>
                            <p>{goal.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Photo Gallery */}
            <section 
                id="gallery" 
                className={`${styles.section} ${styles.gallerySection} ${styles.observe} ${visibleSections.includes('gallery') ? styles.visible : ''}`}
            >
                <h3 className={styles.sectionTitle}>Moments</h3>
               <div className={styles.grid}>
                    <div className={`${styles.photoWrapper} ${styles.photo1}`}>
                        <img src="/anniversary/image1.png" alt="Memory 1" className={styles.photo} />
                    </div>
                    <div className={`${styles.photoWrapper} ${styles.photo2}`}>
                       <img src="/anniversary/image2.png" alt="Memory 2" className={styles.photo} />
                    </div>
                    <div className={`${styles.photoWrapper} ${styles.photo3}`}>
                       <img src="/anniversary/image3.png" alt="Memory 3" className={styles.photo} />
                    </div>
                    <div className={`${styles.photoWrapper} ${styles.photo4}`}>
                       <img src="/anniversary/image4.png" alt="Memory 4" className={styles.photo} />
                    </div>
               </div>
            </section>

            {/* Promise Section */}
            <section 
                id="promise" 
                className={`${styles.section} ${styles.promiseSection} ${styles.observe} ${visibleSections.includes('promise') ? styles.visible : ''}`}
            >
                <div className={styles.letterContent}>
                    <p className={styles.fadeItem}>I don’t promise perfection. I promise presence.</p>
                    <p className={styles.fadeItem}>Not forever in words, but forever in effort.</p>
                    <div className={styles.spacer}></div>
                    <p className={styles.fadeItem}>If I had to choose again,<br/> through every lifetime, every uncertainty —</p>
                    <p className={styles.highlight}>I’d still find my way to you.</p>
                </div>
                <h2 className={styles.promiseText}>No matter how life changes,<br/> I choose you.</h2>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>Always. — Burhanuddin</p>
                <div 
                    onClick={handleSurprise} 
                    className={`${styles.heartTrigger} ${styles.pulse}`}
                    role="button"
                    title="Click me!"
                    aria-label="Trigger hearts"
                >
                    <Heart size={24} fill="currentColor" />
                </div>
                <span className={styles.clickMeHint}>Click me</span>
            </footer>

            {/* Hearts Overlay */}
            {hearts.map(heart => (
                <div 
                    key={heart.id} 
                    className={styles.floatingHeart}
                    style={{ 
                        left: `${heart.left}%`, 
                        animationDuration: `${heart.animationDuration}s` 
                    }}
                >
                    ♥
                </div>
            ))}

            {/* Notification Overlay */}
            <div className={`${styles.notificationContainer} ${activeNotification ? styles.showNotification : ''}`}>
                <div className={styles.notificationCard}>
                    <Bell size={20} className={styles.bellIcon} />
                    <span className={styles.notificationText}>{activeNotification}</span>
                </div>
            </div>

            {/* Envelope Modal */}
            {openEnvelope !== null && (
                <div className={styles.modalOverlay} onClick={() => setOpenEnvelope(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setOpenEnvelope(null)}>
                            <X size={24} />
                        </button>
                        <h4 className={styles.modalTitle}>{ENVELOPES[openEnvelope].title}</h4>
                        <p className={styles.modalText}>{ENVELOPES[openEnvelope].content}</p>
                        <div className={styles.modalFooter}>Love you.</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Anniversary;
