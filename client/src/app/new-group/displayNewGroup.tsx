import { useContext, useState } from "react"
import NewGroup1 from "./Newgroup1"



function Display_New_Group() {

    enum Stepenum{NewGroup1, NewGroup2}
    //const [page, setPage] = useState<Stepenum>(Stepenum.NewGroup)
    const [stage, setStage] = useState('');
    const stage = useContext(StageContext)

	return (
            <StageContext.Provider value={stage}>
            <NewGroup1 /> {/* afficher que si contexte convient ?? */}
            </StageContext.Provider>
	)
}

export default Display_New_Group