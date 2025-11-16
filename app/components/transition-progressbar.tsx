import { useEffect, useState } from "react";
import { Progress } from "./ui/progress"
import { useNavigation } from "react-router";

export default () => {
    const [value, setValue] = useState(0);

    const navigation = useNavigation();

    useEffect(() => {
        setValue(navigation.state === "loading" ? 75 : 0);
    }, [navigation.state]);

    return <Progress value={value} hidden={navigation.state === "idle"} className="top-0 z-50 fixed rounded-none w-full" />
}