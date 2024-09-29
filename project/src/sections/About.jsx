const About = () => {
    return (
      <div className="ml-5 mt-10 mr-5 max-md:flex-col max-md:mb-4">
        <h2 className="mr-4 text-customBrown p-2 text-3xl font-bold ">
          What is Speech Ease?
        </h2>
        <hr></hr>
       <div className="flex flex-col">
        <div className="flex">
        <p>Practice Speaking: Users can practice speaking with real-time feedback, helping them improve fluency and accuracy in their speech.</p>
        <p>Learn Pronunciation: SpeechEase offers personalized lessons to help users learn and correct their pronunciation of challenging words or phrases.</p>
        </div>
        <div className="flex">
        <p>Notebook of Difficult Words: A custom notebook allows users to track words or sounds they struggle with, enabling focused practice on improving specific speech challenges.</p>
        <p>Real-Time Detection: Automatically identifies speech impediments during live practice, allowing users to get immediate insights and corrections.</p>
        </div>
       </div>
      </div>
    );
  };
  
  export default About;