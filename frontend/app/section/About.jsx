const About = () => {
  return (
    <div className="mt-10 max-md:flex-col max-md:mb-4 mr-20 ml-20">
      <h2 className="mr-4 text-customBrown p-2 text-3xl font-bold">What is Speech Ease?</h2>
      <hr />
      <div className="grid grid-cols-2 gap-4 mx-auto mt-10 mr-20 ml-20 text-lg">
        <div className="box p-4 bg-custom text-black rounded-lg">
          <h2 className="flex items-center">
            <img src="/icons/a-woman-who-uses-a-computer-negative-svgrepo-com.svg" alt="" className="w-10 h-10 mr-2" />
            <b><span className="underline text-xl">Practice Speaking</span></b>
          </h2>
          <p>Users can practice speaking with real-time feedback, helping them improve fluency and accuracy in their speech.</p>
        </div>
        <div className="box p-4 bg-custom text-black rounded-lg">
          <h2 className="flex items-center">
            <img src="/icons/medical-examination-female-svgrepo-com.svg" alt="" className="w-10 h-10 mr-2" />
            <b><span className="underline text-xl">Learn Pronunciation</span></b>
          </h2>
          <p>SpeechEase offers personalized lessons to help users learn and correct their pronunciation of challenging words or phrases.</p>
        </div>
        <div className="box p-4 bg-custom text-black rounded-lg">
          <h2 className="flex items-center">
            <img src="/icons/woman-balloon-svgrepo-com.svg" alt="" className="w-10 h-10 mr-2" />
            <b><span className="underline text-xl">Notebook of Difficult Words</span></b>
          </h2>
          <p>A custom notebook allows users to track words or sounds they struggle with, enabling focused practice on improving specific speech challenges.</p>
        </div>
        <div className="box p-4 bg-custom text-black rounded-lg">
          <h2 className="flex items-center">
            <img src="/icons/person-reading-a-book-question-mark-svgrepo-com.svg" alt="" className="w-10 h-10 mr-2" />
            <b><span className="underline text-xl">Real-Time Detection</span></b>
          </h2>
          <p>Automatically identifies speech impediments during live practice, allowing users to get immediate insights and corrections.</p>
        </div>
      </div>
    </div>
  );
};

export default About;