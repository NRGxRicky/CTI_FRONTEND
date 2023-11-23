import React from 'react';

const OpacityContainer = ({opacityContainer, SetParentOpacity}) => {


    return (
        <div>
            <div className="opacity" style={opacityContainer} onClick={() => SetParentOpacity(false)}>
            </div>
            <style jsx>
                {`.opacity {
                  opacity: 0;
                  visibility: hidden;
                  top: 0;
                  width: 100%;
                  height: 100%;
                  background: #0f0f0f;
                  position: fixed;
                  transition: opacity .3s, visibility .3s;
                  z-index: 50;
                }`}
            </style>
        </div>
    );
};

export default OpacityContainer;
