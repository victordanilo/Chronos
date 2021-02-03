import boot from '../../../vendor/uikit/src/js/api/boot';
import UIkit from '../../../vendor/uikit/src/js/uikit-core';
import Countdown from '../../../vendor/uikit/src/js/components/countdown';
import Filter from '../../../vendor/uikit/src/js/components/filter';
import Lightbox from '../../../vendor/uikit/src/js/components/lightbox';
import lightboxPanel from '../../../vendor/uikit/src/js/components/lightbox-panel';
import Notification from '../../../vendor/uikit/src/js/components/notification';
import Parallax from '../../../vendor/uikit/src/js/components/parallax';
import Slider from '../../../vendor/uikit/src/js/components/slider';
import SliderParallax from '../../../vendor/uikit/src/js/components/slider-parallax';
import Slideshow from '../../../vendor/uikit/src/js/components/slideshow';
import Sortable from '../../../vendor/uikit/src/js/components/sortable';
import Tooltip from '../../../vendor/uikit/src/js/components/tooltip';
import Upload from '../../../vendor/uikit/src/js/components/upload';

UIkit.component('countdown', Countdown);
UIkit.component('filter', Filter);
UIkit.component('lightbox', Lightbox);
UIkit.component('lightboxPanel', lightboxPanel);
UIkit.component('notification', Notification);
UIkit.component('parallax', Parallax);
UIkit.component('slider', Slider);
UIkit.component('sliderParallax', SliderParallax);
UIkit.component('slideshow', Slideshow);
UIkit.component('slideshowParallax', SliderParallax);
UIkit.component('sortable', Sortable);
UIkit.component('tooltip', Tooltip);
UIkit.component('upload', Upload);

if (BUNDLED) {
    boot(UIkit);
}

export default UIkit;