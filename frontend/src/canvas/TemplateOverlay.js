import React, { useEffect } from 'react';
import './TemplateOverlay.css';

const TemplateOverlay = (props) => {
  const [posx, setPosx] = React.useState(0);
  const [posy, setPosy] = React.useState(0);
  
  useEffect(() => {
    // Calculate position relative to canvas dimensions
    const x = props.overlayTemplate.position % props.width;
    const y = Math.floor(props.overlayTemplate.position / props.width);
    
    setPosx(x);
    setPosy(y);
  }, [props.overlayTemplate, props.width]);

  const [templateOutline, setTemplateOutline] = React.useState('none');
  useEffect(() => {
    const outlineWidth = 1 * props.canvasScale;
    setTemplateOutline(`${outlineWidth}px solid rgba(200, 0, 0, 0.3)`);
  }, [props.overlayTemplate.image, props.canvasScale]);

  const closeOverlay = () => {
    props.setOverlayTemplate(null);
    props.setTemplateOverlayMode(false);
  };

  return (
    <div
      className='TemplateOverlay'
      style={{
        position: 'absolute',
        left: `${posx}px`,
        top: `${posy}px`,
        width: props.overlayTemplate.width * props.canvasScale,
        height: props.overlayTemplate.height * props.canvasScale,
        transform: `scale(${props.canvasScale})`,
        transformOrigin: '0 0',
        pointerEvents: 'none',
        display: 'block',
        outline: templateOutline
      }}
    >
      <div
        className='TemplateOverlay__image'
        style={{
          backgroundImage: `url(${props.overlayTemplate.image})`,
          width: '100%',
          height: '100%'
        }}
      ></div>
      <div
        className='TemplateOverlay__close Text__medium'
        onClick={closeOverlay}
      >
        X
      </div>
    </div>
  );
};

export default TemplateOverlay;
