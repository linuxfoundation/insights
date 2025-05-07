import {
  onMounted, onUnmounted, ref
} from 'vue';

const useResponsive = () => {
  const pageWidth = ref(0);

  const updatePageWidth = () => {
    pageWidth.value = window.innerWidth;
  };

  const isMobileOrTablet = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator?.userAgent);

  onMounted(() => {
    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updatePageWidth);
  });

  return {
    isMobileOrTablet,
    pageWidth,
  };
};

export default useResponsive;
