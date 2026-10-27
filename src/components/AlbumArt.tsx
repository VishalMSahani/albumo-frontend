import PhotoPlaceholder from "./PhotoPlaceholder";

export default function AlbumArt() {
  return (
    <div className="relative h-[540px] overflow-hidden bg-[#eedbd7] max-[480px]:h-[430px] min-[801px]:max-[1100px]:h-[470px] min-[1500px]:h-[580px]">
      <div className="absolute top-7 left-7 text-[8px] tracking-[0.15em] max-[480px]:text-[6px]">
        THE EVERYWHERE COLLECTION / VOL. 01
      </div>
      <div className="absolute top-[18%] right-[6%] h-[47%] w-[39%] rotate-12 bg-paper px-2.5 pt-2.5 pb-8 shadow-[0_8px_20px_#60433314] [&>span]:mt-[7px] [&>span]:block [&>span]:text-center [&>span]:font-display [&>span]:text-[13px] [&>span]:italic">
        <PhotoPlaceholder slot="hero-detail" tone="sage" label="A little moment" />
        <span>Notes from the road.</span>
      </div>
      <div className="absolute top-[15%] left-[17%] h-[73%] w-[56%] -rotate-9 border-l-[5px] border-[#a35f3d] bg-terracotta px-[27px] pt-[27px] pb-4.5 text-[#fff1e6] shadow-[-4px_2px_0_#874f35,3px_6px_0_#f1e6d7,5px_7px_0_#b56b43,12px_24px_28px_#66423929] max-[480px]:left-[14%] max-[480px]:w-3/5 max-[480px]:px-4.5 max-[480px]:pt-6 max-[480px]:pb-[15px] min-[801px]:max-[1100px]:px-5 min-[801px]:max-[1100px]:py-[22px]">
        <div className="text-[6px] tracking-[0.17em] max-[480px]:text-[5px]">
          A COLLECTION OF GOOD DAYS
        </div>
        <div className="relative z-1 mt-[23px] font-display text-[clamp(34px,3.5vw,49px)] leading-[0.96] tracking-[-0.04em] max-[800px]:text-5xl max-[480px]:mt-5 max-[480px]:text-[37px] min-[801px]:max-[1100px]:text-[35px] min-[1500px]:text-[55px] [&_em]:text-[#f1cfb6]">
          somewhere
          <br />
          <em>worth</em>
          <br />
          keeping.
        </div>
        <div className="mt-5 h-[32%] max-[480px]:mt-4 max-[480px]:h-[29%]">
          <PhotoPlaceholder
            slot="hero-landscape"
            tone="clay"
            label="Your favourite escape"
          />
        </div>
        <div className="mt-[15px] flex justify-between text-[6px] tracking-[0.12em]">
          <span>VOLUME 01</span>
          <span>BY YOU.</span>
        </div>
      </div>
      <div className="absolute right-[7%] bottom-[14%] rotate-5 font-display text-xl leading-[1.35] max-[480px]:right-[5%] max-[480px]:bottom-[13%] max-[480px]:text-base min-[801px]:max-[1100px]:right-[5%] min-[801px]:max-[1100px]:text-base [&_em]:text-berry">
        A little less digital.
        <br />
        <em>A little more forever.</em>
      </div>
      <span className="absolute bottom-[23px] left-7 text-[7px] tracking-[0.16em]">
        YOUR PHOTOS. YOUR STORIES. YOUR ALBUMO.
      </span>
    </div>
  );
}
