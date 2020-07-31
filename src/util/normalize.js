// normalize to 1 -> 0 range
export default function normalize(val) { 
    return 1 - (val / 1000); 
}