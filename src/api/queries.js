import axios from '.'

export const getProviders = async () => {
    try {
        const { data } = await axios.get("providers");
        return data;
    } catch (error) {
        return error;
    }
}

export const getClients = async () => {
    try {
        const { data } = await axios.get("clients");
        return data;
    } catch (error) {
        return error;
    }
}



