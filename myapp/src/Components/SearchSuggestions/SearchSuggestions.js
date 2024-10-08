import './SearchSuggestions.css';

const SearchSuggestions = (suggestion) => {
  const sug = suggestion.suggestion;
  const { service_id, service_name, service_title, service_urls } = sug;
  return (
    <li className="suggestion-item">
      <div className="suggestionCard">
        <img
          src={service_urls}
          alt={service_title}
          className="suggestionImage"
        />
      </div>
      <div className="suggestionNameContainer">
        <p className="suggestionName">{service_name}</p>
      </div>
    </li>
  );
};

export default SearchSuggestions;
