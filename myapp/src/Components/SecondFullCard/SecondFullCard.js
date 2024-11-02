import './SecondFullCard.css';

const FullCard = () => {
  return (
    <div className="zoom-container-secondCard">
      <div className="fullCardContainer">
        <div className="FullCardContentContainer">
          <div>
            <h1 className="acHead">
              Sofa & Home <br /> Cleaning
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
        <div className="SecondFullCardSideImage">
          <img
            src="https://i.postimg.cc/s2g0Sdsr/IMG-20240708-201218.png"
            className="fullCardImage"
          />
        </div>
      </div>
    </div>
  );
};

export default FullCard;
