import {useEffect, useState} from 'react';
import { Switch, Route, useHistory} from "react-router-dom";
import * as auth from "../utils/auth";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";
import resolve from "../images/resolve.svg";
import reject from "../images/reject.svg";
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from "./ImagePopup";
import api from "../utils/api";
import AddPlacePopup from "./AddPlacePopup"
import EditAvatarPopup from "./EditAvatarPopup";
import EditProfilePopup from "./EditProfilePopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

function App() {
  const history = useHistory();
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailName, setEmailName] = useState(null);
  const [popupImage, setPopupImage] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [infoTooltip, setInfoTooltip] = useState(false);

  function onRegister(email, password) {
    auth.registerUser(email, password).then(() => {
      setPopupImage(resolve);
      setPopupTitle("Вы успешно зарегистрировались!");
      history.push("/sign-in");
    }).catch(() => {
      setPopupImage(reject);
      setPopupTitle("Что-то пошло не так! Попробуйте ещё раз.");
    }).finally(handleInfoTooltip);
  }

  function onLogin(email, password) {
    auth.loginUser(email, password).then((res) => {
      localStorage.setItem("jwt", res.token);
      setIsLoggedIn(true);
      setEmailName(email);
      history.push("/");
    }).catch(() => {
      setPopupImage(reject);
      setPopupTitle("Что-то пошло не так! Попробуйте ещё раз.");
      handleInfoTooltip();
    });
  }

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      auth.getToken(jwt).then((res) => {
        if (res) {
          setIsLoggedIn(true);
          setEmailName(res.data.email);
        }
      }).catch((err) => {
        console.error(err);
      });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn === true) {
      history.push("/");
    }
  }, [isLoggedIn, history]);

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()]).then(([user, cards]) => {
      setCurrentUser(user);
      setCards(cards);
    }).catch((err) => {
      console.error(err);
    });
  }, []);
  function handleUpdateUser(data) {
    api.updateUserInfo(data).then((newUser) => {
      setCurrentUser(newUser);
      closeAllPopups();
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(
      (userWhoLiked) => userWhoLiked._id === currentUser._id
    );
    api
      .changeLikeCardStatus(card, !isLiked)
      .then((cardWithChangedLike) => {
        setCards(
          cards.map((cardFromState) =>
            cardFromState._id === card._id ? cardWithChangedLike : cardFromState
          )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  function handleAddPlaceSubmit(data) {
    api.addNewCard(data).then((newCard) => {
      setCards([newCard, ...cards]);
      closeAllPopups();
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleCardDelete(card) {
    api.removeCard(card).then(() => {
      setCards((items) => items.filter((c) => c._id !== card._id && c));
    }).catch((err) => {
      console.error(err);
    });
  }
  
  function handleAvatarUpdate(data) {
    api.updateProfileAvatar(data).then((newAvatar) => {
      setCurrentUser(newAvatar);
      closeAllPopups();
    }).catch((err) => {
      console.error(err);
    });
  }
  
  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  function handleInfoTooltip() {
    setInfoTooltip(true);
  }

  function handlePopupCloseClick(evt) {
    if (evt.target.classList.contains('popup_opened')) {
      closeAllPopups();
    }
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setInfoTooltip(false);
  }

  useEffect(() => {
    if (isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || selectedCard || infoTooltip) {
      function handleEsc(evt) {
        if (evt.key === 'Escape') {
          closeAllPopups();
        }
      }
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
      }
    }
  }, [isEditAvatarPopupOpen, isEditProfilePopupOpen, isAddPlacePopupOpen, selectedCard, infoTooltip])

  function onSignOut() {
    setIsLoggedIn(false);
    setEmailName(null);
    history.push("/sign-in");
    localStorage.removeItem("jwt");
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__content">
        <Header title="Выйти" mail={emailName} onClick={onSignOut} route="" />
        <Switch>

            <Route path="/sign-in" >
              <Login onLogin={onLogin} />
            </Route>

            <Route path="/sign-up">
              <Register onRegister={onRegister} />
            </Route>

            <ProtectedRoute
              component={Main}
              isLogged={isLoggedIn}
              onEditAvatar={handleEditAvatarClick}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onCardClick={handleCardClick}
              cards={cards}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
              path="/"
             />
             
        </Switch>
        <Footer/>
        </div>
      </div>  
          

          <EditProfilePopup 
            isOpen={isEditProfilePopupOpen} 
            onCloseClick={handlePopupCloseClick} 
            onClose={closeAllPopups} 
            onSubmit={handleUpdateUser}
          />
          
          <AddPlacePopup 
            isOpen={isAddPlacePopupOpen} 
            onCloseClick={handlePopupCloseClick} 
            onClose={closeAllPopups} 
            onSubmit={handleAddPlaceSubmit}
          />
          
          <EditAvatarPopup 
            isOpen={isEditAvatarPopupOpen} 
            onCloseClick={handlePopupCloseClick} 
            onClose={closeAllPopups} 
            onSubmit={handleAvatarUpdate}
          />

          <ImagePopup
            card={selectedCard}
            isOpen={isImagePopupOpen} 
            onCloseClick={handlePopupCloseClick}
            onClose={closeAllPopups}
          />

          <InfoTooltip 
            image={popupImage} 
            title={popupTitle} 
            isOpen={infoTooltip} 
            onCloseClick={handlePopupCloseClick}
            onClose={closeAllPopups} 
          />
       
    </CurrentUserContext.Provider>
  );
}

export default App; 
