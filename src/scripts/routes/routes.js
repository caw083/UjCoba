import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import Register from '../pages/register/register';
import Login  from '../pages/login/login';
import AddStoryForm from '../pages/addStoryIG/StoryForm';
import DaftarWishlist from '../pages/daftarWishlist/daftar';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/register' : new Register(),
  '/login' : new Login(),
  '/addstory' : new AddStoryForm(),
  '/wishlist' : new DaftarWishlist(),

};

export default routes;
