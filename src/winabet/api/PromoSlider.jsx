import React, { useState, useEffect } from "react";
import sports from "../../assets/ai_wallpapers-3021102.jpg";
import money from "../../assets/money.jpg";
import stadium from "../../assets/sports.png";
import "./styles/PromoSlider.css";

function PromoSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            url: sports,
            id: "newCustomer",
            title: "1TND = 0.8TND",
            description: "Sign Up Now and receive a RISK-FREE bet up to $500",
        },
        {
            url: money,
            id: "refer",
            title: "Refer A Friend",
            description: "And receive 50TND",
        },
        {
            url: stadium,
            id: "noSweat",
            title: "No Sweat Bet",
            description: "All games available",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            nextPromo(); // Automatically move to the next slide
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [currentIndex]);

    const dots = slides.map((slide, slideIndex) => (
        <div
            className="dot"
            key={slideIndex}
            onClick={() => chooseSlide(slideIndex)}
            style={
                currentIndex === slideIndex
                    ? { color: "var(--color-secondary)" }
                    : { color: "white" }
            }
        >
            ●
        </div>
    ));

    function chooseSlide(slideIndex) {
        setCurrentIndex(slideIndex);
    }

    function previousPromo() {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }

    function nextPromo() {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }

    const backgroundImage = {
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: `url(${slides[currentIndex].url})`,
    };

    return (
        <div className="slider">
            <div>
                <div
                    onClick={previousPromo}
                    className="slider__arrow slider__arrow--left"
                ></div>
                <div
                    onClick={nextPromo}
                    className="slider__arrow slider__arrow--right"
                ></div>
            </div>
            <div style={backgroundImage}></div>
            <h1
                className={`slider__title slider__title--${slides[currentIndex].id}`}
            >
                {slides[currentIndex].title}
            </h1>
            <p
                className={`slider__tagline slider__tagline--${slides[currentIndex].id}`}
            >
                {slides[currentIndex].description}
            </p>
            <div className="slider__dots">{dots}</div>
        </div>
    );
}

export default PromoSlider;
