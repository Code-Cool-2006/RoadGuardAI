import React from 'react';
import styled from 'styled-components';
import { ArrowRight, BadgeCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '@/assets/logo.jpg';

const AnimatedCtaButton = () => {
  return (
    <StyledWrapper>
      <Link to="/login" className="learn-more">
        <span className="circle" aria-hidden="true">
          <span className="icon arrow" />
        </span>
        <span className="button-text">Enter the platform</span>
      </Link>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button,
  .learn-more {
    position: relative;
    display: inline-block;
    cursor: pointer;
    outline: none;
    border: 0;
    vertical-align: middle;
    text-decoration: none;
    background: transparent;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
  }

  .learn-more {
    width: 16rem;
    height: auto;
  }

  .learn-more .circle {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    position: relative;
    display: block;
    margin: 0;
    width: 3rem;
    height: 3rem;
    background: #282936;
    border-radius: 1.625rem;
  }

  .learn-more .circle .icon {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #fff;
  }

  .learn-more .circle .icon.arrow {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    left: 0.625rem;
    width: 1.125rem;
    height: 0.125rem;
    background: none;
  }

  .learn-more .circle .icon.arrow::before {
    position: absolute;
    content: "";
    top: -0.29rem;
    right: 0.0625rem;
    width: 0.625rem;
    height: 0.625rem;
    border-top: 0.125rem solid #fff;
    border-right: 0.125rem solid #fff;
    transform: rotate(45deg);
  }

  .learn-more .button-text {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.75rem 0;
    margin: 0 0 0 1.85rem;
    color: #282936;
    font-weight: 700;
    line-height: 1.6;
    text-align: center;
    text-transform: uppercase;
  }

  .learn-more:hover .circle {
    width: 100%;
  }

  .learn-more:hover .circle .icon.arrow {
    background: #fff;
    transform: translate(1rem, 0);
  }

  .learn-more:hover .button-text {
    color: #fff;
  }
`;

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C1C1C] font-sans">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-[#2B2653]/10 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border border-[#2B2653]/15 bg-white shadow-sm">
              <img src={logoImg} alt="RoadGuard AI Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#1C1C1C] uppercase">RoadGuard AI</p>
              <p className="text-xs text-[#5A5A5A]">Civil operations command center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-[#2B2653]/15 bg-white px-4 py-2 text-sm text-[#2B2653] transition hover:bg-[#2B2653]/5 shadow-sm">
              Sign in
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B2653]/10 bg-white/70 px-3 py-1 my-4 text-sm text-[#2B2653] font-medium shadow-sm">
            <Sparkles className="h-4 w-4 text-[#2B2653]" /> Production-style mock experience for road, water, gas, and electricity operations
          </div>
          <h1 className="mt-8 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
            Build safer cities with <span className="font-serif italic text-[#2B2653]">intelligent</span> public infrastructure coordination.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5A5A5A]">
            Route complaints, coordinate department work orders, detect conflicts before crews clash, and keep citizens informed through a premium, responsive experience.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <AnimatedCtaButton />
          </div>
          <div className="mt-12 grid w-full max-w-5xl gap-4 md:grid-cols-3">
            {[
              ['Citizen reporting', 'Submit complaints with GPS and media.'],
              ['Department work orders', 'Plan routes and assign engineers.'],
              ['AI conflict detection', 'Find overlaps and suggest unified trenching.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[20px] border border-[#2B2653]/10 bg-white p-6 text-left shadow-[0_15px_60px_rgba(43,38,83,0.04)]">
                <CheckCircle2 className="h-6 w-6 text-[#2B2653]" />
                <p className="mt-4 font-semibold text-[#1C1C1C]">{title}</p>
                <p className="mt-2 text-sm leading-7 text-[#5A5A5A]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
