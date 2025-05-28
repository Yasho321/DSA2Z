import React ,{use, useEffect ,useMemo, useState} from 'react'
import{ useAuthStore} from "../store/useAuthStore"

import { Link } from "react-router-dom";

import { Bookmark, PencilIcon, Trash, TrashIcon, Plus, Loader2 } from "lucide-react";
import { useActions } from '../store/useAction';
import { usePlaylistStore } from '../store/usePlaylistStore';
import CreatePlaylistModal from './CreatePlaylistModal';
import AddToPlaylist from './AddToPlaylist';

const ProblemTable = ({problems}) => {
    const {authUser} = useAuthStore()
    const {createPlaylist,getAllPlaylists} = usePlaylistStore (); 
    const {isDeletingProblem,isUpdatingProblem, onDeleteProblem,onEditProblem} = useActions();

    const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
    const [isAddToPlaylistModelOpen , setIsAddToPlaylistModelOpen] = useState(false);
    const [idToAdd, setIdToAdd] = useState(null);

    const [search , setSearch] = useState("");
    const [difficulty , setDifficulty] = useState("ALL");
    const [selectedTag , setSelectedTag] = useState("ALL");
    const [currentPage , setCurrentPage] = useState(1);
    const difficulties = [ "EASY", "MEDIUM", "HARD"];
    const allTags = useMemo(()=>{
        if(!Array.isArray(problems)) return [];
        const tagSet = new Set();
        problems.forEach(problem => {
            problem.tags?.forEach(tag => {
                tagSet.add(tag)
            })
        })
        return Array.from(tagSet);


    });
    const filteredProblems = useMemo(() =>{
        return (problems || []).filter(problem => problem.title.toLowerCase().includes(search.toLowerCase()))
        .filter((problem) => difficulty == "ALL" ? true : problem.difficulty == difficulty)
        .filter((problem) => selectedTag == "ALL" ? true : problem.tags?.includes(selectedTag))
    },[problems , search, difficulty, selectedTag]);

    const itemsPerPage = 10;

    const totalPages = Math.ceil(filteredProblems.length/itemsPerPage);
    const paginatedProblems = useMemo(() =>{
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredProblems.slice(start , end);
    
    },[currentPage , filteredProblems])

    const handleDelete = (problemId) =>{
      onDeleteProblem(problemId);
    }


    const handleAddToPlaylist = (problemId) =>{
      setIsAddToPlaylistModelOpen(true);
      setIdToAdd(problemId);


    }

    const handleCreatePlaylist = async (data) =>{
        await createPlaylist(data);
        await getAllPlaylists();
    }


  return (
    <div className="w-full   mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Problems</h2>
        <button className="btn btn-primary bg-[#4FD1C5] text-white gap-2" onClick={() => setIsCreateModelOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by title"
          className="input input-bordered w-full md:w-1/3 bg-base-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered bg-base-200"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="ALL">All Difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered bg-base-200"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="ALL">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

       <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="table table-zebra table-lg bg-base-200 text-base-content">
          <thead className="bg-base-200">
            <tr>
              <th>Solved</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
{
    paginatedProblems.length > 0 ? (
          paginatedProblems.map((problem)=>{
            const isSolved = problem.solvedBy.some((user)=>user.userId === authUser?.id);

               return (
                  <tr key={problem.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSolved}
                        readOnly
                        className="checkbox checkbox-sm"
                      />
                    </td>
                    <td>
                      <Link to={`/problem/${problem.id}`} className="font-semibold hover:underline">
                        {problem.title}
                      </Link>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(problem.tags || []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="badge badge-outline badge-warning text-xs font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge font-semibold text-xs text-white ${
                          problem.difficulty === "EASY"
                            ? "badge-success"
                            : problem.difficulty === "MEDIUM"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                        {authUser?.role === "ADMIN" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(problem.id)}
                              className="btn btn-sm btn-error"
                            >
                              {isDeletingProblem ? <Loader2 className='animate-spin h-4 w-4' /> :  <TrashIcon className="w-4 h-4 text-white" />}
                             
                            </button>
                            <Link to={`/edit-problem/${problem.id}`} className="btn btn-sm btn-warning" >
                              <PencilIcon className="w-4 h-4 text-white" />

                            </Link>
                          </div>
                        )}
                        <button
                          className="btn btn-sm btn-outline flex gap-2 items-center"
                          onClick={() => handleAddToPlaylist(problem.id)}
                        >
                          <Bookmark className="w-4 h-4" />
                          <span className="hidden sm:inline">Save to Playlist</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );

          })
    ) : ( <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No problems found.
                </td>
              </tr>)
}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <button
          className="btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span className="btn btn-ghost btn-sm">
          {currentPage} / {totalPages}
        </span>
        <button
          className="btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      <CreatePlaylistModal isOpen={isCreateModelOpen} onClose={()=>setIsCreateModelOpen(false)} onSubmit={handleCreatePlaylist} />
      <AddToPlaylist isOpen={isAddToPlaylistModelOpen} onClose={()=>setIsAddToPlaylistModelOpen(false)} problemId={idToAdd} />

    </div>
  )
}

export default ProblemTable