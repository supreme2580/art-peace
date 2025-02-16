export const StencilBotController = (props: any) => {
  return (
    <div
      className="Buttonlike__primary pl-[1rem] pr-[0.5rem] gap-2"
    >
      <p className="Text__medium">Please select a stencil...</p>
      <div
        className="Button__close"
        onClick={() => props.setSelectedBotOption(null)}
      >
        x
      </div>
    </div>
  );
}
