import {ChangeEvent, FormEvent, useState} from "react";

export default function CreateDrugDialog({rf}: {rf: ()=>Promise<void>}) {
    const [name, setName] = useState<string>('');
    const [manufacturer, setManufacturer] = useState<string>('');
    const [api, setApi] = useState<string>('');
    const [mkb10, setMkb10] = useState<string>('');
    const [unit, setUnit] = useState<'g' | 'mg' | 'μg' | 'ml'>('mg');
    const [price, setPrice] = useState<number>(0.0);
    const [amount, setAmount] = useState<number>(0);
    const [packageSize, setPackageSize] = useState<number>(0);
    const [prescriptionOnly, setPrescriptionOnly] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        let body = {
            name: name,
            price: price,
            api: api,
            mkb_10: mkb10,
            manufacturer: manufacturer,
            package_size: packageSize,
            api_per_pill: amount,
            unit: unit,
            prescription_only: prescriptionOnly
        }

        console.log(JSON.stringify(body));


        let response = await fetch(`/api/drugs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            body: JSON.stringify(body),
        });
        if (response.ok) {
            console.log("Success!");

            setApi('');
            setManufacturer('');
            setUnit('g');
            setAmount(0);
            setPrescriptionOnly(false);
            setPackageSize(0);
            setMkb10('');
            setPrice(0.0)
            setAmount(0.0);
            await rf();

        }else{
            console.log("Error!", response);
        }
    }
    type Unit = 'g' | 'mg' | 'μg' | 'ml';
    const changeUnit = (e: ChangeEvent<HTMLSelectElement>) => {
        setUnit(e.target.value as Unit);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-neutral-900 text-white mt-8 p-8 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-4">Create Drug</h2>

            <div className="space-y-4">
                <label
                    className={`block text-sm mb-2 transition-all ${
                        name.length ? "text-neutral-400 visible" : "invisible"
                    }`}
                > Name </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Name"
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <label
                    className={`block text-sm mb-2 transition-all ${
                        manufacturer.length ? "text-neutral-400 visible" : "invisible"
                    }`}
                > Manufacturer </label>

                <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    required
                    placeholder="Manufacturer"
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <label
                    className={`block text-sm mb-2 transition-all ${
                        api.length ? "text-neutral-400 visible" : "invisible"
                    }`}
                > Active Pharmaceutical Ingredient</label>

                <input
                    type="text"
                    value={api}
                    onChange={(e) => setApi(e.target.value)}
                    required
                    placeholder="Active Pharmaceutical Ingredient"
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />


                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm text-neutral-400 mb-1">Amount</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            min={0}
                            max={2500}
                            required
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>


                    <div>
                        <label htmlFor="unit" className="block text-sm text-neutral-400 mb-1">Unit</label>
                        <select
                            id="unit"
                            value={unit}
                            onChange={(e) => changeUnit(e)}
                            required
                            className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="g">g</option>
                            <option value="mg">mg</option>
                            <option value="μg">μg</option>
                            <option value="ml">ml</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-neutral-400 mb-1">Package size</label>
                    <input
                        type="number"
                        value={packageSize}
                        min={0}
                        max={100}
                        required
                        step="1"
                        placeholder="Package size"
                        onChange={(e) => setPackageSize(parseInt(e.target.value))}
                        className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm text-neutral-400 mb-1">Price (€)</label>
                    <input
                        id="price"
                        type="number"
                        value={price}
                        min={0}
                        max={2500}
                        required
                        step="0.01"
                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                        className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <label
                    className={`block text-sm mb-2 transition-all ${
                        mkb10.length ? "text-neutral-400 visible" : "invisible"
                    }`}
                >MKB-10</label>
                <input
                    type="text"
                    value={mkb10}
                    onChange={(e) => setMkb10(e.target.value)}
                    required
                    placeholder="MKB-10"
                    className="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <div className="mt-4">
                    <span className="block text-sm text-neutral-400 mb-2">Prescription Only</span>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="prescription"
                                checked={!prescriptionOnly}
                                onChange={() => setPrescriptionOnly(false)}
                                className="accent-emerald-500"
                            />
                            <span>OTC (No Prescription)</span>
                        </label>


                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="prescription"
                                checked={prescriptionOnly}
                                onChange={() => setPrescriptionOnly(true)}
                                className="accent-emerald-500"
                            />
                            <span>Prescription Required</span>
                        </label>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors p-3 rounded-xl font-semibold mt-6"
            >
                Save Drug
            </button>
        </form>
    );
}