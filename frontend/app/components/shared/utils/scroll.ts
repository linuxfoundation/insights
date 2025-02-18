import {onMounted, onUnmounted, ref} from "vue";

const useScroll = () => {
    const scrollTop = ref(0);
    let body = document?.querySelector('body');

    const updateScrollTop = () => {
        scrollTop.value = body?.scrollTop || 0;
    };

    onMounted(() => {
        body = document?.querySelector('body');
        body?.addEventListener('scroll', updateScrollTop);
        updateScrollTop();
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', updateScrollTop);
    })

    return {
        scrollTop,
    }
}

export default useScroll;
