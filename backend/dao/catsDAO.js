import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let cats;

export default class CatsDAO {
    static async injectDB(conn) {
        if (cats) {
            return;
        }
        try {
            cats = await conn.db(process.env.ANIMALS_NS).collection("Cats");
        } catch (e) {
            console.error(
                `Unable to establish a connection handle in catsDAO: ${e}`,
            )
        }
    }

    static async getCats({
        filters = null,
        page = 0,
        catsPerPage = 20,
    } = {}) {
        let query = {}
        if (filters) {
            if ("breed" in filters) {
                query["$text"] = { $search: filters["breed"] };
            }
            if ("length" in filters) {
                query["size.length"] = { $eq: filters["length"] };
            }
            if ("coat" in filters) {
                query["coat"] = { $eq: filters["coat"] };
            }
            if ("grooming" in filters) {
                query["characteristics.grooming"] = { $eq: filters["grooming"] }
            }
            if ("origin" in filters) {
                query["origin"] = { $eq: filters["origin"] }
            }
            if ("vocal" in filters) {
                query["characteristics.vocal"] = { $eq: filters["vocal"] }
            }
            if ("energy" in filters) {
                query["characteristics.energy"] = { $eq: filters["energy"] }
            }
            if ("first_time_owner" in filters) {
                query["first_time_owner"] = { $eq: filters["first_time_owner"] === 'true' ? true : false }
            }

        }
        console.log(query)
        let cursor;

        try {
            cursor = await cats.find(query);
            // cursor = await cats.updateMany(
            //     {},
            //     { $rename: { "characteristics.talkative": "characteristics.vocal" } }
            // )

        } catch (e) {
            console.error(`Unable to issue find command, ${e}`);
            return { cats: [], totalNumCats: 0 };
        }

        const displayCursor = cursor.limit(catsPerPage).skip(catsPerPage * page);

        try {
            const catsList = await displayCursor.toArray();
            const totalNumCats = await cats.countDocuments(query);
            return { catsList, totalNumCats };
        } catch (e) {
            console.error(
                `Unable to covert cursor to array or problem counting documents, ${e}`
            );
            return { catsList: [], totalNumCats: 0 }
        }
    }

    static async getCatByID(id) {
        try {
            return await cats.findOne({ _id: new ObjectId(id) });
        } catch (e) {
            console.error(`Something went wrong in getCatByID: ${e}`)
            throw e
        }
    }

}