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

// pin the page until all content below apears
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#page1",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
    },
});
//reveal content
tl.from("#main-content", {
    opacity: 0,
    y: 50,
    duration: 1,
});

// pin page 5 and reveal the vis
let tl2 = gsap.timeline({
    scrollTrigger: {
        trigger: "#page5",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
    },
});
//reveal content
tl2.from("#economic-vis", {
    opacity: 0,
    y: 50,
    duration: 1,
});

let tl3 = gsap.timeline({
    scrollTrigger: {
        trigger: "#page7",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
    },
});
//reveal content
tl3.from("#performance-vis", {
    opacity: 0,
    y: 50,
    duration: 1,
});

let tl4 = gsap.timeline({
    scrollTrigger: {
        trigger: "#page9",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
    },
});
//reveal content
tl4.from("#compare-vis", {
    opacity: 0,
    y: 50,
    duration: 1,
});

gsap.utils.toArray(".animate-on-scroll").forEach((section) => {
    gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
            toggleActions: "play reverse play reverse",
        },
    });
});
