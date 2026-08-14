const Hero = () => {
	return (
		<section className="px-6 py-16 md:py-24">
			<div className="mx-auto max-w-5xl rounded-3xl bg-customBrown/10 p-8 md:p-12 shadow-sm">
				<div className="max-w-2xl space-y-6">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-customBrown">
						SpeechEase
					</p>
					<h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
						Practice clearer speech with guided feedback.
					</h1>
					<p className="text-lg text-gray-700 md:text-xl">
						Record your voice, review your transcript, and get a simple signal on how your speech sounds.
					</p>
					<div className="flex flex-wrap gap-4">
						<a
							href="#listen"
							className="rounded-full bg-customBrown px-6 py-3 font-semibold text-white transition hover:bg-customBrown2"
						>
							Start Practicing
						</a>
						<a
							href="#about-us"
							className="rounded-full border border-customBrown px-6 py-3 font-semibold text-customBrown transition hover:bg-customBrown/10"
						>
							Learn More
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
