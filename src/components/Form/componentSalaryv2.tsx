import { typeComponentSalary } from "../Tables/SalaryTable";

interface componentSalaryPropv2 {
    amount: string | number,
    type: typeComponentSalary;
    id: string,
    handleRemove: (id: string, type: typeComponentSalary) => void
}


export const ComponentSalaryv2 = ({ amount, type, id, handleRemove }: componentSalaryPropv2) => {
    const del = async () => {
        handleRemove(id, type);
    }
    return (
        <>
            <div className="flex flex-wrap gap-2">
                <div className={` text-white px-4 py-2 rounded flex items-center bg-blue-500`}>
                    {amount}
                    <button
                        onClick={del}
                        className="ml-2 text-white hover:text-gray-300"
                    >
                        &times;
                    </button>
                </div>
            </div>
        </>
    )
}