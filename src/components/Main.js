import React from 'react';
import Card from "./Card";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

function Main({ onEditAvatar, onEditProfile, onAddPlace, cards, onCardClick, onCardLike, onCardDelete}) {
  const currentUser = React.useContext(CurrentUserContext);
  
  return (
    <main className="content">
      <section className="profile">
        <button className="profile__avatar-edit" type="button" title="Обновить аватар" onClick={onEditAvatar}>
          <img className="profile__avatar" src={currentUser.avatar} alt={currentUser.name}/>
        </button>
        <div className="profile__info">
          <h1 className="profile__name">{currentUser.name}</h1>
          <button className="profile__btn-edit" type="button" title="Редактировать профиль" onClick={onEditProfile}/>
          <p className="profile__about">{currentUser.about}</p>
        </div>
        <button className="profile__btn-add" type="button" title="Добавить новую фотографию" onClick={onAddPlace}/>
      </section>

      <section className="elements">
        <ul className="elements__list">
        {cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              link={card.link}
              name={card.name}
              likes={card.likes.length}
              onCardClick={onCardClick}
              onCardLike={onCardLike}
              onCardDelete={onCardDelete}
            />
          ))}
        </ul>
      </section>
    </main>
  )
}

export default Main;