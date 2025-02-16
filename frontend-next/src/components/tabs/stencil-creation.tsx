import Image from "next/image";
import { BasicTab } from "./basic";
import { sha256 } from "js-sha256";

export const StencilCreationTab = (props: any) => {
  const hashStencilImage = () => {
    // TODO: Change hash to Poseidon
    let hash = sha256(props.stencilColorIds).slice(2);
    return "0x" + hash;
  }

  const submit = async () => {
    console.log("Submitting stencil...");
  };

  return (
    <BasicTab title="Create a Stencil" {...props} style={{ marginBottom: "0.5rem" }} onClose={props.endStencilCreation}>
      {props.stencilImage && (
        <div>
          <div className="flex flex-col w-full">
            <div className="pt-[1rem] pb-[2rem] flex flex-col items-center justify-center gap-1">
              <Image
                src={props.stencilImage.image}
                width={props.stencilImage.width}
                height={props.stencilImage.height}
                alt="Stencil"
                className="Pixel__img mx-auto h-[14rem] w-[20rem] object-contain"
              />
              <p className="Text__xsmall text-center">(colors converted to world's palette)</p>
            </div>
            <div className="px-[0.5rem] mx-[0.5rem] flex flex-row align-center justify-between">
              <p className="Text__medium pr-[1rem]">World&nbsp;&nbsp;&nbsp;&nbsp;:</p>
              <p className="Text__medium pr-[0.5rem] truncate w-[21rem] text-right">{props.worldName}</p>
            </div>
            <div className="px-[0.5rem] mx-[0.5rem] mt-[1rem] flex flex-row align-center justify-between">
              <p className="Text__medium pr-[1rem]">Size&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</p>
              <p className="Text__medium pr-[0.5rem] text-right">{props.stencilImage.width} x {props.stencilImage.height}</p>
            </div>
            <div className="px-[0.5rem] mx-[0.5rem] mt-[1rem] flex flex-row align-center justify-between">
              <p className="Text__medium pr-[1rem]">Position&nbsp;:</p>
              <p className="Text__medium pr-[0.5rem] text-right">
                ({props.stencilPosition % props.canvasWidth},&nbsp;
                {Math.floor(props.stencilPosition / props.canvasWidth)})
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full">
            {props.stencilCreationSelected ? (
              <p className="text-lg text-black px-[0.5rem] mx-[0.5rem] mt-[1rem]">
                Confirm info and submit the new stencil...
              </p>
            ) : (
              <p className="text-lg text-red-500 px-[0.5rem] mx-[0.5rem] mt-[1rem]">
                Select a position on the Canvas for the stencil...
              </p>
            )}
          </div>
          <div className="flex flex-row justify-around mt-[1.5rem] align-center">
            <div
              className="Button__primary Text__medium"
              onClick={() => props.endStencilCreation()}
            >
              Cancel
            </div>
            <div
              className={`Button__primary Text__medium ${!props.stencilCreationSelected ? "Button--disabled" : ""}`}
              onClick={() => submit()}
            >
              Submit
            </div>
          </div>
        </div>
      )}
    </BasicTab>
  );
}
