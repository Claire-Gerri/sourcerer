import '../App.css';
import {
    gql,
    useQuery,
}from "@apollo/client";
import { Pie } from 'react-chartjs-2';

const DATA = gql`
    query { 
        viewer {
            updatedAt
            repositories(first:2) {
                totalCount
                edges {
                    node {
                        languages(first:3) {
                            edges {
                                node {
                                    name
                                    color
                                }
                            }
                        }
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    history {
                                        edges {
                                            node {
                                                changedFiles
                                                tree {
                                                    entries {
                                                        extension
                                                    }
                                                }
                                                additions
                                                deletions
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

function Languages() {
    const { loading, error, data } = useQuery(DATA);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
        let languages = data.viewer.repositories.edges.map((edge) => (
            edge.node.languages.edges.flat().map((edg) => (
                edg.node.name
            ))
        )).flat();
        languages = languages.filter((item, index) => languages.indexOf(item) === index);
        let languagesColor = data.viewer.repositories.edges.map((edge) => (
            edge.node.languages.edges.flat().map((edg) => (
                edg.node.color
            ))
        )).flat();
        languagesColor = languagesColor.filter((item, index) => languagesColor.indexOf(item) === index);
        let lang_par_commit = data.viewer.repositories.edges.map((edge) => (
            edge.node.defaultBranchRef.target.history.edges.map((edge) => (
                edge.node.tree.entries.map((entry) => (
                    entry.extension.substr(1,).replace('js', 'JavaScript').replace('html', 'HTML').replace('css', 'CSS')
                ))
            ))
        )).flat();
        let changedFiles = data.viewer.repositories.edges.map((edge) => (
            edge.node.defaultBranchRef.target.history.edges.map((edge) => (
                edge.node.changedFiles
            ))
        )).flat();
        let additions = data.viewer.repositories.edges.map((edge) => (
            edge.node.defaultBranchRef.target.history.edges.map((edge) => (
                edge.node.additions
            ))
        )).flat();
        let deletions = data.viewer.repositories.edges.map((edge) => (
            edge.node.defaultBranchRef.target.history.edges.map((edge) => (
                edge.node.deletions
            ))
        )).flat();
        let lignes_par_lang = [];
        let commit_par_lang = {};
        for (let i = 0; i < lang_par_commit.length; i++) {
            if (changedFiles[i] == 1) {
                lang_par_commit[i] = lang_par_commit[i][0];
            }
            lignes_par_lang[lang_par_commit[i]] = 0;
            commit_par_lang[lang_par_commit[i]] = 0;
        }
        for (let i = 0; i < lang_par_commit.length; i++) {
            commit_par_lang[lang_par_commit[i]] ++;
            lignes_par_lang[lang_par_commit[i]] += additions[i];
            lignes_par_lang[lang_par_commit[i]] -= deletions[i];
        }
        let commits = [];
        for (const lang in commit_par_lang) {
            commits.push(commit_par_lang[lang])
        }
        let datas = {
            labels: languages,
            datasets: [
              {
                label: 'Rainfall',
                backgroundColor: languagesColor,
                data: commits
              }
            ]
          }

    return(
        <div>
            <section className="languages">
                <div className="section_title">
                    <h2>Languages</h2>
                    <p>{data.viewer.repositories.totalCount} repos<br/>
                        Last updated : {data.viewer.updatedAt}</p>
                    <p>3</p>
                </div>
                <div className="section_content lang">
                    <div className="langages">{languages.map((lang, index) => (
                        <div className="langage_seul">
                            <div>{lang}<div className="lang_couleur" style={{backgroundColor: languagesColor[index]}}></div></div>
                            <div>Commits : <br/>{commit_par_lang[lang]}</div>
                            <div>LOC : <br/>{lignes_par_lang[lang]}</div>
                        </div>
                        ))}
                    </div>
                    <div className="graphic_lang">
                        <Pie
                            data={datas}
                            options={{
                                title:{
                                    display: true,
                                    text: 'Commits per Language',
                                },
                                legend:{
                                    display: true,
                                    position: 'top'
                                }
                            }}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Languages;