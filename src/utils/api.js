import axios from "axios";

const base_api = 'http://10.16.165.147:10009';

export default {
    methods: {
        update(file, f, sampleRate) {
            const formData = new FormData();
            formData.append('sample', file)
            formData.append('fPitchChange', '0')
            formData.append('sampleRate', sampleRate)
            formData.append('sSpeakId', 'alice')
            return axios.post(base_api + '/voice', formData, {
                params: {
                    f0: f
                }
            })
        }
    }
}
