import { Hourglass, BarChart3 } from "lucide-react";
import Navbar from "../../components/Navbar";

const LiveResults = () => {
  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 font-sans">
      <Navbar />

      <div
        className="
          flex items-center justify-center
          px-4 sm:px-6 lg:px-10
          pt-14 sm:pt-28 pb-16
        "
      >
        <div
          className="
            w-full
            max-w-xs sm:max-w-sm lg:max-w-md
            bg-[#0f1117]
            border border-slate-800
            rounded-[2rem] sm:rounded-[2.5rem]
            p-6 sm:p-8 md:p-10
            text-center
            shadow-xl
            animate-in
            zoom-in-95
            duration-500
          "
        >
          <div className="flex justify-center mb-5 sm:mb-6">
            <div
              className="
                bg-indigo-600/10
                p-2 sm:p-2
                rounded-full
                border border-indigo-600/20
              "
            >
              <Hourglass
                className="
                  w-7 h-7
         
         
         
                  sm:w-9 sm:h-9
                  text-indigo-500
                  animate-pulse
                "
              />
            </div>
          </div>

          <p
            className="
              text-white
              text-base
              sm:text-xl
              md:text-2xl
              font-black
              uppercase
              italic
              tracking-tight
            "
          >
            No Results Available
          </p>

          <p
            className="
              text-slate-500
              font-mono
              text-[12px]
              sm:text-[12px]
              md:text-[10px]
              uppercase
              tracking-[0.35em]
              mt-3
              leading-relaxed
            "
          >
            Live voting results cannot be displayed right now
            <br className="hidden sm:block" />
            because applications are still ongoing.
          </p>

          <div className="mt-7 sm:mt-8 flex justify-center">
            <span
              className="
                inline-flex items-center gap-2
                px-4 py-2
                sm:px-5 sm:py-2.5
                rounded-full
                border border-indigo-600/30
                bg-indigo-600/10
                text-indigo-500
                text-[7px]
                sm:text-[8px]
                font-black
                uppercase
                tracking-widest
              "
            >
              <BarChart3 size={13} />
              Applications Ongoing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveResults;