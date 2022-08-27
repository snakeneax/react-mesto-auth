function ImagePopup({card, onClose, onCloseClick, isOpen}) {
  return (
    <div className="popup__opened" onClick={onClose}>
    <div className={`popup popup_viewer ${isOpen && 'popup_opened'}`} onClick={onCloseClick}>
      <div className="popup__content">
        <img className="popup__image" src={card?.link} alt={card?.name}/>
        <h2 className="popup__description">{card?.name}</h2>
        <button className="popup__btn-close" type="button" title="Закрыть" onClick={onClose}/>
      </div>
    </div>
    </div>
  )
}

export default ImagePopup;