import { SalaryCal } from "@/action/dev/calSalary";

export const dynamic = "force-dynamic";
export const GET = async () => {
    try {
        const team = ['A', 'B', 'C', 'D', 'E', 'SW']
        const result = await Promise.allSettled(
            team.map(async (t) => {
                try {
                    let month = (new Date().getMonth() + 1).toString(); // Convert to string
                    let year = new Date().getFullYear().toString();
                    const salary = await SalaryCal({ month, year, team: t })
                    return {
                        team: t,
                        salary
                    }
                } catch (error) {
                    return {
                        team: t,
                        error
                    }
                }
            })
        )
        // You should return something here
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        // You should return an error response here
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}