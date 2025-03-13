// Title animations
var typed = new Typed(".typing", {
    strings: ["Visualizing the LLM Industry"],
    typeSpeed: 40,
    backSpeed: 30,
    startDelay: 500,
    backDelay: 500,
});

dotNav("section", "easeInOutQuint");

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// fade box transition
gsap.fromTo(".fade-box", {
    opacity: 0,
}, {
    opacity: 1,
    duration: 1,
    scrollTrigger: {
        trigger: ".fade-box",
        start: "top 80%",
        end: "top 50%",
        scrub: true,
    },
});

