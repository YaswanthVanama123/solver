import './FullCard.css';

const FullCard = () => {
  return (
    <div className="zoom-container-laptop zoom-container-mobile ">
      <div className="fullCardContainer">
        <div className="FullCardContentContainer">
          <div>
            <h1 className="acHead">
              Air Condictioner <br /> Reparing
            </h1>
          </div>
          <div>
            <p className="fullCardChargesContentContainer">
              Just 149/- minimum charges for first half and hour
            </p>
          </div>
          <div className="fullCardButtonContainer">
            <button className="fullCardButton">Try Now</button>
          </div>
        </div>
        <div className="fullCardSideImage">
          <img
            src="https://i.postimg.cc/cCckdv1f/IMG-20240708-184529.jpg"
            className="fullCardImage"
          />
        </div>
      </div>
    </div>
  );
};

export default FullCard;
