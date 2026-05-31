export default function IncomingCallModal({ caller, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[350px]">
        <h2 className="text-xl font-bold mb-4">Incoming Call</h2>

        <p className="mb-6">{caller?.firstName} is calling...</p>

        <div className="flex gap-4">
          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Accept
          </button>

          <button
            onClick={onReject}
            className="flex-1 bg-red-600 text-white py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
