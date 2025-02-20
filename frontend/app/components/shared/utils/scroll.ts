import {onMounted, onUnmounted, ref} from "vue";

const useScroll = () => {
    const scrollTop = ref(0);
    const scrollPercentage = ref(0);
    let body = document?.querySelector('body');

    const updateScrollTop = () => {
        scrollTop.value = body?.scrollTop || 0;

        const scrollHeight = body?.scrollHeight || 0;
        const clientHeight = body?.clientHeight || 0;
        scrollPercentage.value = scrollHeight > clientHeight
            ? (scrollTop.value / (scrollHeight - clientHeight)) * 100
            : 0;
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
        scrollPercentage
    }
}

export default useScroll;
