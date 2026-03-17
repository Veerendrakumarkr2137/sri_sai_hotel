import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

export default function AdminRooms() {
  const { token } = useContext(AuthContext);
  const [rooms, setRooms] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    images: [""],
    roomType: "Deluxe Room",
    capacity: "2",
    availableRooms: "1"
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        availableRooms: Number(formData.availableRooms),
        amenities: ["Free WiFi", "TV", "AC"] // Default amenities for simplicity via dashboard
      };
      
      const { data } = await axios.post(`${API_BASE_URL}/api/rooms`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        toast.success("Room added successfully");
        setShowAddModal(false);
        setFormData({
          title: "",
          description: "",
          price: "",
          images: [""],
          roomType: "Deluxe Room",
          capacity: "2",
          availableRooms: "1"
        });
        fetchRooms();
      }
    } catch (err) {
      toast.error("Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/rooms`);
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      toast.error("Failed to load rooms");
    }
  };

  const deleteRoom = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Room deleted");
      fetchRooms();
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Rooms</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg font-semibold">
          <PlusCircle className="w-5 h-5" /> Add New Room
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Room Info</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Capacity</th>
              <th className="px-6 py-4 font-semibold">Price/Night</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rooms.map((room) => (
              <tr key={room._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 text-base">{room.title}</div>
                  <div className="text-slate-500 line-clamp-1 max-w-xs">{room.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium text-xs uppercase tracking-wider">
                    {room.roomType}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{room.capacity} Guests</td>
                <td className="px-6 py-4 font-bold text-slate-900">₹{room.price.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => deleteRoom(room._id)} className="text-red-600 hover:text-red-800 transition-colors p-2 bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-lg">
            No rooms available yet. Add some rooms to get started.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Room</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-900 text-xl font-bold">×</button>
            </div>
            
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Room Type</label>
                  <select required name="roomType" value={formData.roomType} onChange={handleChange} className="w-full border rounded-lg p-2">
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Executive Room">Executive Room</option>
                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg p-2" rows={3} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input required type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Rooms</label>
                  <input required type="number" name="availableRooms" value={formData.availableRooms} onChange={handleChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image Network URL (Primary)</label>
                <input required type="text" name="images" value={formData.images} onChange={(e) => setFormData({ ...formData, images: [e.target.value] })} placeholder="https://..." className="w-full border rounded-lg p-2" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                  {loading ? "Saving..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
